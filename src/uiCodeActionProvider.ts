import * as vscode from "vscode"
import type { UITranslationManager } from "./uiTranslationManager"

export class UICodeActionProvider implements vscode.CodeActionProvider {
  constructor(private uiTranslationManager: UITranslationManager) {}

  async provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken,
  ): Promise<vscode.CodeAction[]> {
    const actions: vscode.CodeAction[] = []

    // Check if there are translation diagnostics in the range
    const translationDiagnostics = context.diagnostics.filter(
      (diagnostic) => diagnostic.source === "Code Translator" && diagnostic.code === "ui-translation",
    )

    for (const diagnostic of translationDiagnostics) {
      const text = document.getText(diagnostic.range)
      const translation = this.extractTranslationFromDiagnostic(diagnostic.message)

      if (translation) {
        // Create action to replace with translation
        const replaceAction = new vscode.CodeAction(`Replace with "${translation}"`, vscode.CodeActionKind.QuickFix)

        replaceAction.edit = new vscode.WorkspaceEdit()
        replaceAction.edit.replace(document.uri, diagnostic.range, translation)
        replaceAction.diagnostics = [diagnostic]

        actions.push(replaceAction)

        // Create action to add translation key
        const keyAction = new vscode.CodeAction("Use translation key", vscode.CodeActionKind.Refactor)

        const translationKey = this.generateTranslationKey(text)
        keyAction.edit = new vscode.WorkspaceEdit()
        keyAction.edit.replace(document.uri, diagnostic.range, `t('${translationKey}')`)

        actions.push(keyAction)

        // Create action to ignore this translation
        const ignoreAction = new vscode.CodeAction("Ignore this translation", vscode.CodeActionKind.QuickFix)

        ignoreAction.command = {
          title: "Ignore Translation",
          command: "codeTranslator.ignoreTranslation",
          arguments: [text, document.uri],
        }

        actions.push(ignoreAction)
      }
    }

    // Add action to extract all UI strings
    if (actions.length === 0) {
      const extractAction = new vscode.CodeAction("Extract UI strings for translation", vscode.CodeActionKind.Refactor)

      extractAction.command = {
        title: "Extract UI Strings",
        command: "codeTranslator.extractUIStrings",
        arguments: [document.uri],
      }

      actions.push(extractAction)
    }

    return actions
  }

  private extractTranslationFromDiagnostic(message: string): string | null {
    const match = message.match(/→ "([^"]+)"/)
    return match ? match[1] : null
  }

  private generateTranslationKey(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
  }
}
