import * as vscode from "vscode"
import { TranslationProvider } from "./translationProvider"
import { LanguageDetector } from "./languageDetector"
import { HoverProvider } from "./hoverProvider"
import { CompletionProvider } from "./completionProvider"
import { ConfigurationManager } from "./configurationManager"
import { UITranslationManager } from "./uiTranslationManager"
import { LocalizationProvider } from "./localizationProvider"
import { UICodeActionProvider } from "./uiCodeActionProvider"
import { TranslationTreeProvider } from "./translationTreeProvider"

let translationProvider: TranslationProvider
let languageDetector: LanguageDetector
let configManager: ConfigurationManager
let hoverProvider: HoverProvider
let completionProvider: CompletionProvider
let uiTranslationManager: UITranslationManager
let localizationProvider: LocalizationProvider
let uiCodeActionProvider: UICodeActionProvider
let translationTreeProvider: TranslationTreeProvider

export function activate(context: vscode.ExtensionContext) {
  console.log("Code Translator extension is now active!")

  // Initialize components
  translationProvider = new TranslationProvider()
  languageDetector = new LanguageDetector()
  configManager = new ConfigurationManager()
  uiTranslationManager = new UITranslationManager()
  localizationProvider = new LocalizationProvider()

  hoverProvider = new HoverProvider(translationProvider, languageDetector, configManager)
  completionProvider = new CompletionProvider(translationProvider, languageDetector, configManager)
  uiCodeActionProvider = new UICodeActionProvider(uiTranslationManager)
  translationTreeProvider = new TranslationTreeProvider(uiTranslationManager)

  // Register existing commands
  const toggleCommand = vscode.commands.registerCommand("codeTranslator.toggle", () => {
    const config = vscode.workspace.getConfiguration("codeTranslator")
    const currentState = config.get<boolean>("enabled", true)
    config.update("enabled", !currentState, vscode.ConfigurationTarget.Global)

    vscode.window.showInformationMessage(`Code Translator ${!currentState ? "enabled" : "disabled"}`)
  })

  const configureCommand = vscode.commands.registerCommand("codeTranslator.configure", async () => {
    await showLanguageConfiguration()
  })

  const clearCacheCommand = vscode.commands.registerCommand("codeTranslator.clearCache", () => {
    translationProvider.clearCache()
    uiTranslationManager.clearCache()
    vscode.window.showInformationMessage("Translation cache cleared")
  })

  // Register new UI translation commands
  const generateLocalizationCommand = vscode.commands.registerCommand(
    "codeTranslator.generateLocalization",
    async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
      if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace folder found")
        return
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Generating localization files...",
          cancellable: false,
        },
        async () => {
          await localizationProvider.generateLocalizationFile(workspaceFolder)
        },
      )
    },
  )

  const extractUIStringsCommand = vscode.commands.registerCommand(
    "codeTranslator.extractUIStrings",
    async (uri: vscode.Uri) => {
      const document = await vscode.workspace.openTextDocument(uri)
      const translations = await localizationProvider.analyzeDocument(document)

      vscode.window.showInformationMessage(`Found ${translations.length} UI strings for translation`)
    },
  )

  const showTranslationDetailsCommand = vscode.commands.registerCommand(
    "codeTranslator.showTranslationDetails",
    (translation: any) => {
      const panel = vscode.window.createWebviewPanel(
        "translationDetails",
        "Translation Details",
        vscode.ViewColumn.Two,
        { enableScripts: true },
      )

      panel.webview.html = getTranslationDetailsHTML(translation)
    },
  )

  const ignoreTranslationCommand = vscode.commands.registerCommand(
    "codeTranslator.ignoreTranslation",
    (text: string, uri: vscode.Uri) => {
      // Add to ignore list
      vscode.window.showInformationMessage(`Ignoring translation for: ${text}`)
    },
  )

  const exportTranslationsCommand = vscode.commands.registerCommand("codeTranslator.exportTranslations", async () => {
    const translations = uiTranslationManager.exportTranslations()
    const uri = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file("translations.json"),
      filters: { JSON: ["json"] },
    })

    if (uri) {
      await vscode.workspace.fs.writeFile(uri, Buffer.from(translations, "utf8"))
      vscode.window.showInformationMessage("Translations exported successfully")
    }
  })

  const importTranslationsCommand = vscode.commands.registerCommand("codeTranslator.importTranslations", async () => {
    const uris = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectMany: false,
      filters: { JSON: ["json"] },
    })

    if (uris && uris[0]) {
      const content = await vscode.workspace.fs.readFile(uris[0])
      uiTranslationManager.importTranslations(content.toString())
      translationTreeProvider.refresh()
      vscode.window.showInformationMessage("Translations imported successfully")
    }
  })

  // Register providers for all supported languages
  const supportedLanguages = [
    "javascript",
    "typescript",
    "python",
    "java",
    "csharp",
    "cpp",
    "c",
    "go",
    "rust",
    "php",
    "ruby",
    "swift",
    "kotlin",
    "scala",
    "html",
    "css",
    "scss",
    "less",
    "json",
    "xml",
    "yaml",
    "markdown",
    "jsx",
    "tsx",
    "vue",
  ]

  const hoverDisposable = vscode.languages.registerHoverProvider(supportedLanguages, hoverProvider)
  const completionDisposable = vscode.languages.registerCompletionItemProvider(
    supportedLanguages,
    completionProvider,
    ".",
  )
  const codeActionDisposable = vscode.languages.registerCodeActionsProvider(supportedLanguages, uiCodeActionProvider)

  // Register tree view
  const treeView = vscode.window.createTreeView("translationExplorer", {
    treeDataProvider: translationTreeProvider,
    showCollapseAll: true,
  })

  // Auto-analyze documents on change
  const documentChangeDisposable = vscode.workspace.onDidChangeTextDocument(async (event) => {
    const config = vscode.workspace.getConfiguration("codeTranslator")
    if (config.get<boolean>("ui.autoDetect", true)) {
      await localizationProvider.analyzeDocument(event.document)
      translationTreeProvider.refresh()
    }
  })

  // Add disposables to context
  context.subscriptions.push(
    toggleCommand,
    configureCommand,
    clearCacheCommand,
    generateLocalizationCommand,
    extractUIStringsCommand,
    showTranslationDetailsCommand,
    ignoreTranslationCommand,
    exportTranslationsCommand,
    importTranslationsCommand,
    hoverDisposable,
    completionDisposable,
    codeActionDisposable,
    treeView,
    documentChangeDisposable,
    localizationProvider,
  )

  // Show welcome message
  vscode.window
    .showInformationMessage(
      "Code Translator with UI Localization is ready! Hover over text to see translations.",
      "Configure Languages",
      "Generate Localization",
    )
    .then((selection) => {
      if (selection === "Configure Languages") {
        vscode.commands.executeCommand("codeTranslator.configure")
      } else if (selection === "Generate Localization") {
        vscode.commands.executeCommand("codeTranslator.generateLocalization")
      }
    })
}

async function showLanguageConfiguration() {
  const config = vscode.workspace.getConfiguration("codeTranslator")

  const targetLanguages = [
    { label: "English", value: "en" },
    { label: "Spanish", value: "es" },
    { label: "French", value: "fr" },
    { label: "German", value: "de" },
    { label: "Dutch", value: "nl" },
    { label: "Italian", value: "it" },
    { label: "Portuguese", value: "pt" },
    { label: "Russian", value: "ru" },
    { label: "Chinese (Simplified)", value: "zh-cn" },
    { label: "Japanese", value: "ja" },
    { label: "Korean", value: "ko" },
  ]

  const selectedTarget = await vscode.window.showQuickPick(targetLanguages, {
    placeHolder: "Select target language for translations",
    matchOnDescription: true,
  })

  if (selectedTarget) {
    await config.update("targetLanguage", selectedTarget.value, vscode.ConfigurationTarget.Global)
    vscode.window.showInformationMessage(`Target language set to ${selectedTarget.label}`)
  }
}

function getTranslationDetailsHTML(translation: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Translation Details</title>
        <style>
            body { font-family: var(--vscode-font-family); padding: 20px; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: var(--vscode-textPreformat-foreground); }
            .value { margin-left: 10px; }
            .confidence { 
                padding: 2px 8px; 
                border-radius: 4px; 
                background: var(--vscode-badge-background);
                color: var(--vscode-badge-foreground);
            }
        </style>
    </head>
    <body>
        <h2>Translation Details</h2>
        <div class="detail-row">
            <span class="label">Original Text:</span>
            <span class="value">${translation.originalText}</span>
        </div>
        <div class="detail-row">
            <span class="label">Translated Text:</span>
            <span class="value">${translation.translatedText}</span>
        </div>
        <div class="detail-row">
            <span class="label">Element Type:</span>
            <span class="value">${translation.context.elementType}</span>
        </div>
        <div class="detail-row">
            <span class="label">Framework:</span>
            <span class="value">${translation.context.framework || "Unknown"}</span>
        </div>
        <div class="detail-row">
            <span class="label">File Path:</span>
            <span class="value">${translation.context.filePath}</span>
        </div>
        <div class="detail-row">
            <span class="label">Confidence:</span>
            <span class="value confidence">${Math.round(translation.confidence * 100)}%</span>
        </div>
        <div class="detail-row">
            <span class="label">Last Updated:</span>
            <span class="value">${new Date(translation.lastUpdated).toLocaleString()}</span>
        </div>
    </body>
    </html>
  `
}

export function deactivate() {
  if (translationProvider) {
    translationProvider.dispose()
  }
  if (localizationProvider) {
    localizationProvider.dispose()
  }
}
