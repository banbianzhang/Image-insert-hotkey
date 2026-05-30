export type Language = "en" | "zh";

export interface I18nStrings {
  // Command
  commandName: string;

  // Settings
  settingsLanguage: string;
  settingsLanguageDesc: string;
  settingsAltTemplate: string;
  settingsAltTemplateDesc: string;
  settingsPathType: string;
  settingsPathTypeDesc: string;
  settingsPathRelative: string;
  settingsPathAbsolute: string;
  settingsExtraExtensions: string;
  settingsExtraExtensionsDesc: string;
  settingsExtraExtensionsPlaceholder: string;
  settingsReset: string;
  settingsResetDesc: string;
  settingsResetButton: string;
  settingsAssetFolder: string;
  settingsAssetFolderDesc: string;
  settingsAssetFolderPlaceholder: string;

  // Template help tooltip
  templateHelpTitle: string;
  templateHelpFilename: string;
  templateHelpFormat: string;
  templateHelpFullname: string;
  templateHelpEscape: string;

  // Notices
  noticeNoEditor: string;
  noticeCopyFailed: string;
  noticeSettingsReset: string;
}

const en: I18nStrings = {
  commandName: "Insert image",
  settingsLanguage: "Language",
  settingsLanguageDesc: "Display language for plugin settings and notices.",
  settingsAltTemplate: "Alt text template",
  settingsAltTemplateDesc:
    "Template for the image alt text. Use variables to insert dynamic values.",
  settingsPathType: "Insert path type",
  settingsPathTypeDesc:
    "Whether to insert the image path as relative to the note or absolute from the vault root.",
  settingsPathRelative: "Relative",
  settingsPathAbsolute: "Absolute",
  settingsExtraExtensions: "Extra file extensions",
  settingsExtraExtensionsDesc:
    "Additional image file extensions to allow (comma-separated). Default extensions: jpg, jpeg, png, gif, bmp, webp, svg.",
  settingsExtraExtensionsPlaceholder: "e.g. ico,tiff,avif",
  settingsReset: "Reset to defaults",
  settingsResetDesc:
    "Restore all settings to their default values.",
  settingsResetButton: "Reset",
  settingsAssetFolder: "Asset folder",
  settingsAssetFolderDesc:
    "Subfolder in the vault where external images will be copied to. Leave empty to use the same folder as the current note.",
  settingsAssetFolderPlaceholder: "e.g. assets or images",

  templateHelpTitle: "Available template variables:",
  templateHelpFilename: "${filename} — file name without extension",
  templateHelpFormat: "${format} — file extension (e.g. png, jpg)",
  templateHelpFullname: "${fullname} — file name with extension",
  templateHelpEscape: "\\${ ... } — use backslash to escape",

  noticeNoEditor: "No active editor found.",
  noticeCopyFailed: "Failed to copy image to vault.",
  noticeSettingsReset: "Settings have been reset to defaults.",
};

const zh: I18nStrings = {
  commandName: "插入图片",
  settingsLanguage: "语言",
  settingsLanguageDesc: "插件设置和通知的显示语言。",
  settingsAltTemplate: "图片注释模板",
  settingsAltTemplateDesc:
    "图片注释文本的模板。可以使用变量来插入动态内容。",
  settingsPathType: "路径类型",
  settingsPathTypeDesc:
    "插入图片时使用相对于笔记的路径，还是相对于库根目录的绝对路径。",
  settingsPathRelative: "相对路径",
  settingsPathAbsolute: "绝对路径",
  settingsExtraExtensions: "额外文件格式",
  settingsExtraExtensionsDesc:
    "额外允许的图片文件格式（逗号分隔）。默认格式：jpg、jpeg、png、gif、bmp、webp、svg。",
  settingsExtraExtensionsPlaceholder: "例如：ico,tiff,avif",
  settingsReset: "恢复默认配置",
  settingsResetDesc:
    "将所有设置恢复为默认值。",
  settingsResetButton: "恢复",
  settingsAssetFolder: "资源文件夹",
  settingsAssetFolderDesc:
    "外部图片复制到库中的子文件夹。留空则使用当前笔记所在的文件夹。",
  settingsAssetFolderPlaceholder: "例如：assets 或 images",

  templateHelpTitle: "可用的模板变量：",
  templateHelpFilename: "${filename} — 文件名（不带后缀）",
  templateHelpFormat: "${format} — 文件格式（如 png、jpg）",
  templateHelpFullname: "${fullname} — 文件名（带后缀）",
  templateHelpEscape: "\\${ ... } — 使用反斜杠转义",

  noticeNoEditor: "未找到活动的编辑器。",
  noticeCopyFailed: "复制图片到库中失败。",
  noticeSettingsReset: "设置已恢复为默认值。",
};

export function getStrings(lang: Language): I18nStrings {
  return lang === "zh" ? zh : en;
}
