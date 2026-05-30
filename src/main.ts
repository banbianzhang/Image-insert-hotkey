import {
  type Editor,
  type MarkdownFileInfo,
  normalizePath,
  Notice,
  Platform,
  Plugin,
} from "obsidian";
import {
  DEFAULTS,
  getAllowedExtensions,
  ImageInserterSettingTab,
  loadSettings,
  type ImageInserterSettings,
} from "./settings";
import { getStrings } from "./i18n";

declare function require(module: "electron"): any;

export default class ImageInsertHotkeyPlugin extends Plugin {
  settings!: ImageInserterSettings;

  async onload() {
    this.settings = await loadSettings(this);

    this.addCommand({
      id: "insert-image",
      name: getStrings(this.settings.language).commandName,
      hotkeys: [{ modifiers: [Platform.isMacOS ? "Ctrl" : "Alt"], key: "i" }],
      editorCallback: (editor, view) => this.insertImage(editor, view),
    });

    this.addSettingTab(new ImageInserterSettingTab(this.app, this));
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private insertImage(
    editor: Editor,
    view: MarkdownFileInfo,
  ): void {
    const t = getStrings(this.settings.language);

    const input = document.createElement("input");
    input.type = "file";
    input.accept = getAllowedExtensions(this.settings)
      .map((ext) => `.${ext}`)
      .join(",");

    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const filePath: string | undefined = require("electron").webUtils?.getPathForFile(file);
        if (!filePath) {
          // Fallback: read the file content from the File object
          const buf = await file.arrayBuffer();
          const destPath = await this.copyToVault(buf, file.name);
          this.insertMarkdown(editor, view, destPath, file.name);
          return;
        }

        const vaultBasePath = (this.app.vault.adapter as any).getBasePath
          ? (this.app.vault.adapter as any).getBasePath()
          : "";

        if (vaultBasePath && filePath.startsWith(vaultBasePath)) {
          // File is already inside the vault
          const vaultRelPath = normalizePath(
            filePath.substring(vaultBasePath.length),
          );
          this.insertMarkdown(editor, view, vaultRelPath, file.name);
        } else {
          // File is outside the vault — copy it in
          const buf = await file.arrayBuffer();
          const destPath = await this.copyToVault(buf, file.name);
          this.insertMarkdown(editor, view, destPath, file.name);
        }
      } catch (err) {
        new Notice(t.noticeCopyFailed);
        console.error("Image insert hotkey error:", err);
      }
    });

    input.click();
  }

  private async copyToVault(
    buf: ArrayBuffer,
    originalName: string,
  ): Promise<string> {
    const destDir = this.getDestinationDir();
    const uniquePath = await this.resolveUniquePath(destDir, originalName);
    await this.app.vault.createBinary(uniquePath, buf);
    return uniquePath;
  }

  private getDestinationDir(): string {
    const { assetFolder } = this.settings;
    if (assetFolder) {
      return normalizePath(assetFolder);
    }
    const activeFile = this.app.workspace.getActiveFile();
    if (activeFile) {
      return activeFile.parent ? activeFile.parent.path : "";
    }
    return "";
  }

  private async resolveUniquePath(
    dir: string,
    originalName: string,
  ): Promise<string> {
    const baseName = originalName.replace(/\.\w+$/, "");
    const extMatch = originalName.match(/\.(\w+)$/);
    const ext = extMatch ? extMatch[0] : "";

    let candidate = normalizePath(dir ? `${dir}/${originalName}` : originalName);

    let counter = 1;
    while (this.app.vault.getAbstractFileByPath(candidate)) {
      candidate = normalizePath(
        dir
          ? `${dir}/${baseName}-${counter}${ext}`
          : `${baseName}-${counter}${ext}`,
      );
      counter++;
    }

    return candidate;
  }

  private insertMarkdown(
    editor: Editor,
    view: MarkdownFileInfo,
    vaultPath: string,
    originalName: string,
  ): void {
    const alt = this.processAltTemplate(originalName);
    const displayPath = this.computeDisplayPath(view, vaultPath);
    const md = `![${alt}](${displayPath})`;

    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    const isBlankLine = line.trim() === "";

    if (isBlankLine) {
      // Cursor is on an empty line — just insert with newline prefix
      editor.replaceRange(`\n${md}`, cursor);
    } else {
      // Move to end of line and insert newline + image
      editor.replaceRange(`\n${md}`, { line: cursor.line, ch: line.length });
    }
  }

  private computeDisplayPath(
    view: MarkdownFileInfo,
    vaultPath: string,
  ): string {
    if (this.settings.pathType === "absolute") {
      return normalizePath(vaultPath);
    }

    const activeFile = view.file;
    if (!activeFile) return normalizePath(vaultPath);

    const noteDir = activeFile.parent ? activeFile.parent.path : "";

    if (!noteDir) return normalizePath(vaultPath);

    return computeRelativePath(noteDir, vaultPath);
  }

  private processAltTemplate(originalName: string): string {
    const template = this.settings.altTemplate;
    const dotIdx = originalName.lastIndexOf(".");
    const filename =
      dotIdx > 0 ? originalName.substring(0, dotIdx) : originalName;
    const format =
      dotIdx > 0 ? originalName.substring(dotIdx + 1) : "";
    const fullname = originalName;

    // Process template with escaped \${ ... } handling
    const placeholder = "\x00ESCAPED\x00";

    // Replace escaped \${ with placeholder
    let result = template.replace(/\\\$\{/g, placeholder);

    // Replace known variables
    result = result.replace(/\$\{filename\}/g, filename);
    result = result.replace(/\$\{format\}/g, format);
    result = result.replace(/\$\{fullname\}/g, fullname);

    // Restore escaped sequences (remove the backslash)
    result = result.replace(new RegExp(placeholder, "g"), "${");

    return result;
  }
}

function computeRelativePath(fromDir: string, toPath: string): string {
  const fromParts = fromDir.split("/").filter((p) => p.length > 0);
  const toParts = toPath.split("/").filter((p) => p.length > 0);

  let commonLen = 0;
  while (
    commonLen < fromParts.length &&
    commonLen < toParts.length &&
    fromParts[commonLen] === toParts[commonLen]
  ) {
    commonLen++;
  }

  const up = fromParts.slice(commonLen).map(() => "..");
  const down = toParts.slice(commonLen);

  return [...up, ...down].join("/");
}
