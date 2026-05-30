# Image Insert Hotkey

在 Obsidian 中通过快捷键（默认 Option+I）快速插入图片。按下快捷键弹出文件选择窗口，选择图片后自动复制到库中，并在光标位置插入 Markdown 图片语法。

Insert images into Obsidian notes via a configurable hotkey (default Alt+I / Option+I). Opens a system file picker, copies external images into the vault, and inserts Markdown image syntax at the cursor.

## 功能 | Features

### 核心功能 | Core

1. **快捷键插入图片** — 默认 `control+I`（macOS）或 `Alt+I`，可在 Obsidian 快捷键设置中自定义
2. **文件选择窗口** — 按下快捷键后弹出系统文件选择器，默认筛选常见图片格式
3. **智能插入** — 选择图片后自动在光标位置换行并插入 `![注释](路径)` 格式的 Markdown 语法。若图片在库外则自动复制到库中

### 可选功能 | Options

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

## 文件结构 | File structure

```
.
├── src/
│   ├── main.ts           # 插件入口：命令注册、文件选择、图片复制与插入逻辑
│   ├── settings.ts       # 设置接口、默认值、设置标签页 UI
│   └── i18n.ts           # 所有用户界面字符串（英文、中文）
├── styles.css            # 设置页样式（帮助图标、代码格式等）
├── esbuild.config.mjs    # 构建配置：src/main.ts → main.js（CommonJS）
├── manifest.json         # Obsidian 插件清单
├── versions.json         # 最低 Obsidian 版本兼容映射
├── package.json          # npm 脚本与依赖
└── tsconfig.json         # TypeScript 配置（ES2020，严格空值检查）
```

## 架构 | Architecture

插件类 `ImageInsertHotkeyPlugin`（`src/main.ts`）继承自 Obsidian 的 `Plugin`，在 `onload()` 中注册 `insert-image` 命令并绑定默认快捷键。触发时创建隐藏的 `<input type="file">` 元素并设置 `accept` 属性为允许的图片格式，从而打开系统文件选择器。

选择文件后，通过 `(file as any).path` 获取文件绝对路径，与库根路径对比判断文件是否已在库中。外部文件通过 `app.vault.createBinary()` 复制到库中的目标文件夹（可在设置中配置"资源文件夹"，未配置则使用当前笔记所在目录）。文件名重复时自动追加 `-1`、`-2` 等后缀（`resolveUniquePath()` in `src/main.ts:110-131`）。

`insertMarkdown()` 方法（`src/main.ts:133-154`）处理两种光标场景：若光标在空行则直接插入；否则移动到行尾后换行插入。生成的 Markdown 格式为 `![alt](path)`，其中 alt 文本由用户配置的模板生成，路径支持相对/绝对两种模式。

设置模块（`src/settings.ts`）中 `loadSettings()` 将存储数据与 `DEFAULTS` 浅层合并，设置对象的 `version` 字段用于未来数据迁移。设置标签页 `ImageInserterSettingTab` 渲染所有配置项，修改语言设置后会立即重新渲染整个标签页以切换界面语言。`getAllowedExtensions()` 将内置格式列表与用户额外配置的格式合并。

所有用户界面字符串集中在 `src/i18n.ts`，包含 `en`（英文）和 `zh`（中文）两套，通过 `getStrings(lang)` 根据语言设置返回对应字符串集。

**关键插入流程：** 快捷键 → 文件选择器 → 判断库内/库外 → 复制到库（如需要）→ 生成 alt 文本（模板变量替换 + 转义处理）→ 计算路径（相对/绝对）→ 插入 Markdown

## 构建 | Build

```bash
npm install
npm run dev        # 开发模式（监听文件变化，内联 sourcemap）
npm run build      # 生产构建（类型检查 + 压缩，无 sourcemap）
```

使用 esbuild 将 `src/main.ts` 打包为 `main.js`（CommonJS 格式，目标 ES2020）。`obsidian`、`electron`、CodeMirror 相关包标记为外部依赖（由 Obsidian 运行时提供）。

## 安装 | Install

### 开发安装

```bash
# 符号链接（修改后重新构建即可生效）
ln -s "$(pwd)" "/path/to/your-vault/.obsidian/plugins/image-insert-hotkey"

# 或手动复制构建产物
cp main.js manifest.json styles.css "/path/to/your-vault/.obsidian/plugins/image-insert-hotkey/"
```

然后在 Obsidian 中：设置 → 第三方插件 → 启用 "Image insert hotkey"。

## 环境要求 | Prerequisites

- Node.js 18+
- Obsidian ≥ 1.5.0
