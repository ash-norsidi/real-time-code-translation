import * as vscode from "vscode"
import { UITranslationManager, type UITranslation } from "./uiTranslationManager"

export interface LocalizationConfig {
  enabled: boolean
  autoDetect: boolean
  targetLanguage: string
  supportedFrameworks: string[]
  excludePatterns: string[]
  includeFileTypes: string[]
}

export class LocalizationProvider {
  private uiTranslationManager: UITranslationManager
  private config: LocalizationConfig
  private diagnosticCollection: vscode.DiagnosticCollection

  constructor() {
    this.uiTranslationManager = new UITranslationManager()
    this.config = this.loadConfiguration()
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection("ui-translations")
  }

  private loadConfiguration(): LocalizationConfig {
    const config = vscode.workspace.getConfiguration("codeTranslator")

    return {
      enabled: config.get<boolean>("ui.enabled", true),
      autoDetect: config.get<boolean>("ui.autoDetect", true),
      targetLanguage: config.get<string>("targetLanguage", "en"),
      supportedFrameworks: config.get<string[]>("ui.supportedFrameworks", ["react", "vue", "angular", "html"]),
      excludePatterns: config.get<string[]>("ui.excludePatterns", ["node_modules", "dist", "build"]),
      includeFileTypes: config.get<string[]>("ui.includeFileTypes", ["jsx", "tsx", "vue", "html", "js", "ts"]),
    }
  }

  async analyzeDocument(document: vscode.TextDocument): Promise<UITranslation[]> {
    if (!this.config.enabled) {
      return []
    }

    if (!this.shouldAnalyzeFile(document.fileName)) {
      return []
    }

    const content = document.getText()
    const uiTerms = await this.uiTranslationManager.extractUITerms(content, document.fileName)

    if (uiTerms.length > 0) {
      const translatedTerms = await this.uiTranslationManager.translateUITerms(uiTerms, this.config.targetLanguage)

      this.updateDiagnostics(document, translatedTerms)
      return translatedTerms
    }

    return []
  }

  private shouldAnalyzeFile(fileName: string): boolean {
    // Check if file type is supported
    const extension = fileName.split(".").pop()?.toLowerCase()
    if (!extension || !this.config.includeFileTypes.includes(extension)) {
      return false
    }

    // Check exclude patterns
    for (const pattern of this.config.excludePatterns) {
      if (fileName.includes(pattern)) {
        return false
      }
    }

    return true
  }

  private updateDiagnostics(document: vscode.TextDocument, translations: UITranslation[]) {
    const diagnostics: vscode.Diagnostic[] = []

    for (const translation of translations) {
      if (translation.confidence > 0.7 && translation.originalText !== translation.translatedText) {
        const ranges = this.findTextRanges(document, translation.originalText)

        for (const range of ranges) {
          const diagnostic = new vscode.Diagnostic(
            range,
            `UI Translation available: "${translation.originalText}" → "${translation.translatedText}"`,
            vscode.DiagnosticSeverity.Information,
          )

          diagnostic.code = "ui-translation"
          diagnostic.source = "Code Translator"
          diagnostic.tags = [vscode.DiagnosticTag.Unnecessary]

          diagnostics.push(diagnostic)
        }
      }
    }

    this.diagnosticCollection.set(document.uri, diagnostics)
  }

  private findTextRanges(document: vscode.TextDocument, text: string): vscode.Range[] {
    const ranges: vscode.Range[] = []
    const content = document.getText()
    let index = 0

    while ((index = content.indexOf(text, index)) !== -1) {
      const startPos = document.positionAt(index)
      const endPos = document.positionAt(index + text.length)
      ranges.push(new vscode.Range(startPos, endPos))
      index += text.length
    }

    return ranges
  }

  async generateLocalizationFile(workspaceFolder: vscode.WorkspaceFolder): Promise<void> {
    const allTranslations: UITranslation[] = []

    // Scan all files in workspace
    const files = await vscode.workspace.findFiles(
      new vscode.RelativePattern(workspaceFolder, "**/*.{jsx,tsx,vue,html,js,ts}"),
      new vscode.RelativePattern(workspaceFolder, "{node_modules,dist,build}/**"),
    )

    for (const file of files) {
      const document = await vscode.workspace.openTextDocument(file)
      const translations = await this.analyzeDocument(document)
      allTranslations.push(...translations)
    }

    // Group translations by language and context
    const localizationData = this.groupTranslations(allTranslations)

    // Generate localization files
    await this.writeLocalizationFiles(workspaceFolder, localizationData)

    vscode.window.showInformationMessage(`Generated localization files with ${allTranslations.length} translations`)
  }

  private groupTranslations(translations: UITranslation[]): { [language: string]: { [key: string]: string } } {
    const grouped: { [language: string]: { [key: string]: string } } = {}

    for (const translation of translations) {
      if (!grouped[translation.language]) {
        grouped[translation.language] = {}
      }

      grouped[translation.language][translation.key] = translation.translatedText
    }

    return grouped
  }

  private async writeLocalizationFiles(
    workspaceFolder: vscode.WorkspaceFolder,
    localizationData: { [language: string]: { [key: string]: string } },
  ): Promise<void> {
    const localesDir = vscode.Uri.joinPath(workspaceFolder.uri, "locales")

    try {
      await vscode.workspace.fs.createDirectory(localesDir)
    } catch (error) {
      // Directory might already exist
    }

    for (const [language, translations] of Object.entries(localizationData)) {
      const fileName = `${language}.json`
      const filePath = vscode.Uri.joinPath(localesDir, fileName)
      const content = JSON.stringify(translations, null, 2)

      await vscode.workspace.fs.writeFile(filePath, Buffer.from(content, "utf8"))
    }

    // Generate index file
    const indexContent = this.generateLocalizationIndex(Object.keys(localizationData))
    const indexPath = vscode.Uri.joinPath(localesDir, "index.js")
    await vscode.workspace.fs.writeFile(indexPath, Buffer.from(indexContent, "utf8"))
  }

  private generateLocalizationIndex(languages: string[]): string {
    return `// Auto-generated localization index
const translations = {
${languages.map((lang) => `  '${lang}': require('./${lang}.json')`).join(",\n")}
};

function getTranslation(key, language = 'en') {
  return translations[language]?.[key] || key;
}

function getAllTranslations(language = 'en') {
  return translations[language] || {};
}

module.exports = {
  translations,
  getTranslation,
  getAllTranslations,
  supportedLanguages: [${languages.map((lang) => `'${lang}'`).join(", ")}]
};
`
  }

  dispose() {
    this.diagnosticCollection.dispose()
  }
}
