import * as vscode from "vscode"
import type { TranslationProvider } from "./translationProvider"
import type { LanguageDetector } from "./languageDetector"
import type { ConfigurationManager } from "./configurationManager"

export class HoverProvider implements vscode.HoverProvider {
  constructor(
    private translationProvider: TranslationProvider,
    private languageDetector: LanguageDetector,
    private configManager: ConfigurationManager,
  ) {}

  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
  ): Promise<vscode.Hover | null> {
    const config = this.configManager.getConfiguration()

    if (!config.enabled) {
      return null
    }

    const context = this.languageDetector.detectContext(document, position)

    // Check if we should translate based on context and configuration
    if (!this.shouldTranslate(context, config)) {
      return null
    }

    const word = this.languageDetector.getWordAtPosition(document, position)

    if (!word || word.length < config.minWordLength) {
      return null
    }

    if (!this.languageDetector.isNonEnglishText(word)) {
      return null
    }

    try {
      const translation = await this.translationProvider.translate(word, config.targetLanguage, "auto")

      if (!translation || translation.confidence < 0.5) {
        return null
      }

      if (translation.originalText.toLowerCase() === translation.translatedText.toLowerCase()) {
        return null
      }

      const markdown = new vscode.MarkdownString()
      markdown.isTrusted = true

      markdown.appendMarkdown(`**Translation:** ${translation.translatedText}\n\n`)
      markdown.appendMarkdown(`*Source:* ${translation.sourceLanguage} → ${translation.targetLanguage}\n\n`)
      markdown.appendMarkdown(`*Confidence:* ${Math.round(translation.confidence * 100)}%\n\n`)

      if (context.isComment) {
        markdown.appendMarkdown(`*Context:* Comment`)
      } else if (context.isString) {
        markdown.appendMarkdown(`*Context:* String literal`)
      } else if (context.isIdentifier) {
        markdown.appendMarkdown(`*Context:* Identifier`)
      }

      const range = document.getWordRangeAtPosition(position)
      return new vscode.Hover(markdown, range)
    } catch (error) {
      console.error("Error providing hover translation:", error)
      return null
    }
  }

  private shouldTranslate(context: any, config: any): boolean {
    if (context.isComment && !config.translateComments) {
      return false
    }

    if (context.isString && !config.translateStrings) {
      return false
    }

    if (context.isIdentifier && !config.translateIdentifiers) {
      return false
    }

    return true
  }
}
