import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import type ImageInsertHotkeyPlugin from "./main";
import { getStrings, type Language } from "./i18n";

export interface ImageInserterSettings {
  version: number;
  language: Language;
  altTemplate: string;
  pathType: "relative" | "absolute";
  extraExtensions: string;
  assetFolder: string;
}

export const DEFAULTS: ImageInserterSettings = {
  version: 1,
  language: "en",
  altTemplate: "${filename}",
  pathType: "relative",
  extraExtensions: "",
  assetFolder: "",
};

export const DEFAULT_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "webp",
  "svg",
];

export function getAllowedExtensions(settings: ImageInserterSettings): string[] {
  const extras = settings.extraExtensions
    .split(",")
    .map((s) => s.trim().toLowerCase().replace(/^\./, ""))
    .filter((s) => s.length > 0);
  return [...DEFAULT_EXTENSIONS, ...extras];
}

export async function loadSettings(
  plugin: ImageInsertHotkeyPlugin,
): Promise<ImageInserterSettings> {
  const raw = (await plugin.loadData()) as any;
  if (!raw) return { ...DEFAULTS };

  if (!raw.version || raw.version < 1) {
    raw.version = 1;
    await plugin.saveData(raw);
  }

  return { ...DEFAULTS, ...raw };
}

export class ImageInserterSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private plugin: ImageInsertHotkeyPlugin,
  ) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("image-insert-hotkey-settings");

    const t = getStrings(this.plugin.settings.language);

    // Language
    new Setting(containerEl)
      .setName(t.settingsLanguage)
      .setDesc(t.settingsLanguageDesc)
      .addDropdown((dropdown) =>
        dropdown
          .addOption("en", "English")
          .addOption("zh", "中文")
          .setValue(this.plugin.settings.language)
          .onChange(async (value: Language) => {
            this.plugin.settings.language = value;
            await this.plugin.saveSettings();
            this.display();
          }),
      );

    // Alt text template
    const altTemplateSetting = new Setting(containerEl)
      .setName(t.settingsAltTemplate)
      .setDesc(t.settingsAltTemplateDesc);

    altTemplateSetting.addText((text) =>
      text
        .setPlaceholder("${filename}")
        .setValue(this.plugin.settings.altTemplate)
        .onChange(async (value) => {
          this.plugin.settings.altTemplate = value;
          await this.plugin.saveSettings();
        }),
    );

    this.addTemplateHelpIcon(altTemplateSetting, t);

    // Path type
    new Setting(containerEl)
      .setName(t.settingsPathType)
      .setDesc(t.settingsPathTypeDesc)
      .addDropdown((dropdown) =>
        dropdown
          .addOption("relative", t.settingsPathRelative)
          .addOption("absolute", t.settingsPathAbsolute)
          .setValue(this.plugin.settings.pathType)
          .onChange(async (value: "relative" | "absolute") => {
            this.plugin.settings.pathType = value;
            await this.plugin.saveSettings();
          }),
      );

    // Asset folder
    new Setting(containerEl)
      .setName(t.settingsAssetFolder)
      .setDesc(t.settingsAssetFolderDesc)
      .addText((text) =>
        text
          .setPlaceholder(t.settingsAssetFolderPlaceholder)
          .setValue(this.plugin.settings.assetFolder)
          .onChange(async (value) => {
            this.plugin.settings.assetFolder = value.trim();
            await this.plugin.saveSettings();
          }),
      );

    // Extra extensions
    new Setting(containerEl)
      .setName(t.settingsExtraExtensions)
      .setDesc(t.settingsExtraExtensionsDesc)
      .addText((text) =>
        text
          .setPlaceholder(t.settingsExtraExtensionsPlaceholder)
          .setValue(this.plugin.settings.extraExtensions)
          .onChange(async (value) => {
            this.plugin.settings.extraExtensions = value;
            await this.plugin.saveSettings();
          }),
      );

    // Reset to defaults
    new Setting(containerEl)
      .setName(t.settingsReset)
      .setDesc(t.settingsResetDesc)
      .addButton((button) =>
        button
          .setButtonText(t.settingsResetButton)
          .setWarning()
          .onClick(async () => {
            Object.assign(this.plugin.settings, { ...DEFAULTS });
            await this.plugin.saveSettings();
            this.display();
            new Notice(t.noticeSettingsReset);
          }),
      );
  }

  private addTemplateHelpIcon(
    setting: Setting,
    t: ReturnType<typeof getStrings>,
  ): void {
    const tooltipLines = [
      t.templateHelpTitle,
      "",
      t.templateHelpFilename,
      t.templateHelpFormat,
      t.templateHelpFullname,
      t.templateHelpEscape,
    ];

    setting.controlEl.createSpan({
      cls: "template-help-icon",
      text: "?",
      attr: {
        "aria-label": tooltipLines.join("\n"),
      },
    });
  }
}
