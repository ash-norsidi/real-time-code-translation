import * as vscode from "vscode"
import { TranslationProvider } from "./translationProvider"
import { LanguageDetector } from "./languageDetector"
import { HoverProvider } from "./hoverProvider"
import { CompletionProvider } from "./completionProvider"
import { ConfigurationManager } from "./configurationManager"

let translationProvider: TranslationProvider
let languageDetector: LanguageDetector
let configManager: ConfigurationManager
let hoverProvider: HoverProvider
let completionProvider: CompletionProvider

export function activate(context: vscode.ExtensionContext) {
  console.log("Code Translator extension is now active!")

  // Initialize components
  translationProvider = new TranslationProvider()
  languageDetector = new LanguageDetector()
  configManager = new ConfigurationManager()
  hoverProvider = new HoverProvider(translationProvider, languageDetector, configManager)
  completionProvider = new CompletionProvider(translationProvider, languageDetector, configManager)

  // Register commands
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
    vscode.window.showInformationMessage("Translation cache cleared")
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
  ]

  const hoverDisposable = vscode.languages.registerHoverProvider(supportedLanguages, hoverProvider)

  const completionDisposable = vscode.languages.registerCompletionItemProvider(
    supportedLanguages,
    completionProvider,
    ".",
  )

  // Add disposables to context
  context.subscriptions.push(toggleCommand, configureCommand, clearCacheCommand, hoverDisposable, completionDisposable)

  // Show welcome message
  vscode.window
    .showInformationMessage(
      "Code Translator is ready! Hover over non-English text to see translations.",
      "Configure Languages",
    )
    .then((selection) => {
      if (selection === "Configure Languages") {
        vscode.commands.executeCommand("codeTranslator.configure")
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

  const currentTarget = config.get<string>("targetLanguage", "en")
  const selectedTarget = await vscode.window.showQuickPick(targetLanguages, {
    placeHolder: "Select target language for translations",
    matchOnDescription: true,
  })

  if (selectedTarget) {
    await config.update("targetLanguage", selectedTarget.value, vscode.ConfigurationTarget.Global)
    vscode.window.showInformationMessage(`Target language set to ${selectedTarget.label}`)
  }
}

export function deactivate() {
  if (translationProvider) {
    translationProvider.dispose()
  }
}
