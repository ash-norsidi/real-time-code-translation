import * as vscode from "vscode"
import type { TranslationProvider } from "./translationProvider"
import type { LanguageDetector } from "./languageDetector"
import type { ConfigurationManager } from "./configurationManager"

export class CompletionProvider implements vscode.CompletionItemProvider {
  constructor(
    private translationProvider: TranslationProvider,
    private languageDetector: LanguageDetector,
    private configManager: ConfigurationManager,
  ) {}

  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext,
  ): Promise<vscode.CompletionItem[]> {
    const config = this.configManager.getConfiguration()

    if (!config.enabled) {
      return []
    }

    const line = document.lineAt(position.line)
    const lineText = line.text.substring(0, position.character)

    // Look for partial words that might need translation
    const wordMatch = lineText.match(/(\S+)$/)
    if (!wordMatch) {
      return []
    }

    const partialWord = wordMatch[1]

    if (partialWord.length < config.minWordLength) {
      return []
    }

    if (!this.languageDetector.isNonEnglishText(partialWord)) {
      return []
    }

    try {
      const translation = await this.translationProvider.translate(partialWord, config.targetLanguage, "auto")

      if (!translation || translation.confidence < 0.5) {
        return []
      }

      if (translation.originalText.toLowerCase() === translation.translatedText.toLowerCase()) {
        return []
      }

      const completionItem = new vscode.CompletionItem(translation.translatedText, vscode.CompletionItemKind.Text)

      completionItem.detail = `Translation of "${translation.originalText}"`
      completionItem.documentation = new vscode.MarkdownString(
        `**Original:** ${translation.originalText}\n\n` +
          `**Translation:** ${translation.translatedText}\n\n` +
          `**Language:** ${translation.sourceLanguage} → ${translation.targetLanguage}\n\n` +
          `**Confidence:** ${Math.round(translation.confidence * 100)}%`,
      )

      completionItem.insertText = translation.translatedText
      completionItem.filterText = partialWord
      completionItem.sortText = "0" // High priority

      return [completionItem]
    } catch (error) {
      console.error("Error providing completion translation:", error)
      return []
    }
  }
}
