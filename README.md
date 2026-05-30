# Image Insert Hotkey · 图片快捷插入

[English](#english) | [中文](#中文)

---

## 中文

在 Obsidian 中通过快捷键快速插入图片。按下快捷键弹出系统文件选择器，选择图片后自动复制到库中，并在光标位置插入 Markdown 图片语法。

### 功能

**核心功能**

1. **快捷键插入图片** — 默认 `Ctrl+I`（macOS）或 `Alt+I`，可在 Obsidian 快捷键设置中自定义
2. **文件选择窗口** — 按下快捷键后弹出系统文件选择器，默认筛选常见图片格式
3. **智能插入** — 选择图片后自动在光标位置换行并插入 `![注释](路径)` 格式的 Markdown。若图片在库外则自动复制到库中

**可选功能**

1. **图片注释模板** — 默认使用文件名（不带后缀）作为 alt text。支持动态变量：
   - `${filename}` — 文件名（不带后缀）
   - `${format}` — 文件格式（如 png、jpg）
   - `${fullname}` — 完整文件名（带后缀）
   - 使用 `\${` 转义 `${` 字符
   - 配置项末尾有 `?` 图标，鼠标悬浮查看变量说明

2. **路径类型** — 可选择相对路径（相对于当前笔记）或绝对路径（相对于库根目录）

3. **额外文件格式** — 除默认的 jpg、jpeg、png、gif、bmp、webp、svg 外，可自行添加扩展名（逗号分隔）

4. **恢复默认配置** — 一键恢复所有设置为出厂默认值

5. **中英文支持** — 插件命令名称、设置项、提示信息均支持英文和中文切换

### 文件结构

```
.
├── src/
│   ├── main.ts           # 插件入口：命令注册、文件选择、图片复制与插入逻辑
│   ├── settings.ts       # 设置接口、默认值、设置标签页 UI
│   └── i18n.ts           # 所有用户界面字符串（英文、中文）
├── styles.css            # 设置页样式
├── esbuild.config.mjs    # 构建配置
├── manifest.json         # Obsidian 插件清单
├── versions.json         # 最低 Obsidian 版本兼容映射
├── package.json
└── tsconfig.json
```

### 架构

插件类 `ImageInsertHotkeyPlugin`（`src/main.ts`）继承自 Obsidian 的 `Plugin`，在 `onload()` 中注册 `insert-image` 命令并绑定默认快捷键。触发时创建隐藏的 `<input type="file">` 元素并设置 `accept` 属性为允许的图片格式，从而打开系统文件选择器。

选择文件后，通过 Electron 的 `webUtils.getPathForFile()` API 获取文件绝对路径，与库根路径对比判断文件是否已在库中。外部文件通过 `app.vault.createBinary()` 复制到库中（目标文件夹可在设置中配置，未配置则使用当前笔记所在目录）。文件名重复时自动追加 `-1`、`-2` 等后缀。

`insertMarkdown()` 方法处理两种光标场景：若光标在空行则直接插入；否则移动到行尾后换行插入。生成的 Markdown 格式为 `![alt](path)`，其中 alt 文本由用户配置的模板生成，路径支持相对/绝对两种模式。

设置模块（`src/settings.ts`）中 `loadSettings()` 将存储数据与 `DEFAULTS` 浅层合并，设置对象的 `version` 字段用于未来数据迁移。设置标签页 `ImageInserterSettingTab` 渲染所有配置项，修改语言设置后会立即重新渲染整个标签页以切换界面语言。`getAllowedExtensions()` 将内置格式列表与用户额外配置的格式合并。

所有用户界面字符串集中在 `src/i18n.ts`，包含 `en`（英文）和 `zh`（中文）两套，通过 `getStrings(lang)` 根据语言设置返回对应字符串集。

**关键流程：** 快捷键 → 文件选择器 → 获取文件路径 → 判断库内/库外 → 复制到库（如需要）→ 生成 alt 文本（模板变量替换 + 转义处理）→ 计算路径（相对/绝对）→ 插入 Markdown

### 构建

```bash
npm install
npm run dev        # 开发模式（监听文件变化，内联 sourcemap）
npm run build      # 生产构建（类型检查 + 压缩，无 sourcemap）
```

使用 esbuild 将 `src/main.ts` 打包为 `main.js`（CommonJS，目标 ES2020）。`obsidian`、`electron` 标记为外部依赖（由 Obsidian 运行时提供）。

### 安装（开发）

```bash
# 符号链接方式
ln -s "$(pwd)" "/path/to/your-vault/.obsidian/plugins/image-insert-hotkey"

# 或手动复制构建产物
cp main.js manifest.json styles.css "/path/to/your-vault/.obsidian/plugins/image-insert-hotkey/"
```

然后在 Obsidian 中：设置 → 第三方插件 → 启用 "Image insert hotkey"。

### 环境要求

- Node.js 18+
- Obsidian ≥ 1.5.0

---

## English

Insert images into Obsidian notes via a configurable hotkey. Opens a system file picker, copies external images into the vault, and inserts Markdown image syntax at the cursor.

### Features

**Core**

1. **Hotkey image insertion** — Default `Ctrl+I` (macOS) or `Alt+I` (other platforms), customizable in Obsidian's hotkey settings
2. **System file picker** — Opens the native file picker filtered to common image formats
3. **Smart insertion** — Automatically inserts `![alt](path)` Markdown at the cursor. Files outside the vault are copied in first

**Options**

1. **Alt text template** — Defaults to the file name (without extension). Supports variables:
   - `${filename}` — File name without extension
   - `${format}` — File format (e.g. png, jpg)
   - `${fullname}` — Full file name with extension
   - Escape `${` with `\${`
   - A `?` help icon at the end of the setting shows available variables on hover

2. **Path type** — Choose relative path (to current note) or absolute path (from vault root)

3. **Extra file extensions** — Beyond the built-in defaults (jpg, jpeg, png, gif, bmp, webp, svg), add your own comma-separated extensions

4. **Reset to defaults** — One-click restore of all settings to factory defaults

5. **i18n** — All UI strings support English and Chinese

### File structure

```
.
├── src/
│   ├── main.ts           # Plugin entry: command registration, file picker, copy & insert logic
│   ├── settings.ts       # Settings interface, defaults, settings tab UI
│   └── i18n.ts           # All user-facing strings (English, Chinese)
├── styles.css            # Settings tab styles
├── esbuild.config.mjs    # Build configuration
├── manifest.json         # Obsidian plugin manifest
├── versions.json         # Minimum Obsidian version compatibility map
├── package.json
└── tsconfig.json
```

### Architecture

The plugin class `ImageInsertHotkeyPlugin` (`src/main.ts`) extends Obsidian's `Plugin`. It registers the `insert-image` command in `onload()` with platform-specific default hotkeys. When triggered, it creates a hidden `<input type="file">` element with `accept` set to allowed image formats, opening the system file picker.

On file selection, the absolute filesystem path is obtained via Electron's `webUtils.getPathForFile()` API. If the file is already inside the vault it is linked directly; otherwise it is copied in via `app.vault.createBinary()`. The destination folder is configurable via the "asset folder" setting (falls back to the current note's directory). Duplicate file names get `-1`, `-2` suffixes automatically.

`insertMarkdown()` handles two cursor scenarios: blank line (insert directly) or populated line (move to end of line, then insert with newline). The inserted Markdown is `![alt](path)`, where alt text is generated from the user's template and the path can be relative or absolute.

The settings module (`src/settings.ts`) shallow-merges stored data with `DEFAULTS` on load. The `version` field enables future data migration. The settings tab `ImageInserterSettingTab` renders all configuration items; changing the language re-renders the entire tab. `getAllowedExtensions()` merges built-in extensions with user extras.

All UI strings live in `src/i18n.ts` with `en` and `zh` sets, returned by `getStrings(lang)`.

**Key flow:** Hotkey → file picker → get file path → check if in vault → copy to vault (if needed) → generate alt text (template substitution + escape handling) → compute path (relative/absolute) → insert Markdown

### Build

```bash
npm install
npm run dev        # Dev mode with watch and inline sourcemaps
npm run build      # Production build (type-check + minify, no sourcemaps)
```

esbuild bundles `src/main.ts` to `main.js` (CommonJS, target ES2020). `obsidian` and `electron` are externals provided by the Obsidian runtime.

### Install (development)

```bash
# Symlink approach
ln -s "$(pwd)" "/path/to/your-vault/.obsidian/plugins/image-insert-hotkey"

# Or copy build artifacts
cp main.js manifest.json styles.css "/path/to/your-vault/.obsidian/plugins/image-insert-hotkey/"
```

Then in Obsidian: Settings → Community plugins → Enable "Image insert hotkey".

### Prerequisites

- Node.js 18+
- Obsidian ≥ 1.5.0
