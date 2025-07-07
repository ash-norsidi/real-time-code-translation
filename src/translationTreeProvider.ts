import * as vscode from "vscode"
import type { UITranslation, UITranslationManager } from "./uiTranslationManager"
import type { Thenable } from "vscode"

export class TranslationTreeProvider implements vscode.TreeDataProvider<TranslationItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<TranslationItem | undefined | null | void> =
    new vscode.EventEmitter<TranslationItem | undefined | null | void>()
  readonly onDidChangeTreeData: vscode.Event<TranslationItem | undefined | null | void> =
    this._onDidChangeTreeData.event

  constructor(private uiTranslationManager: UITranslationManager) {}

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element: TranslationItem): vscode.TreeItem {
    return element
  }

  getChildren(element?: TranslationItem): Thenable<TranslationItem[]> {
    if (!element) {
      // Root level - show categories
      return Promise.resolve([
        new TranslationItem("UI Elements", vscode.TreeItemCollapsibleState.Expanded, "category"),
        new TranslationItem("Code Terms", vscode.TreeItemCollapsibleState.Expanded, "category"),
        new TranslationItem("Recent", vscode.TreeItemCollapsibleState.Collapsed, "category"),
      ])
    }

    if (element.contextValue === "category") {
      return this.getCategoryChildren(element.label as string)
    }

    return Promise.resolve([])
  }

  private async getCategoryChildren(category: string): Promise<TranslationItem[]> {
    const allTranslations = this.uiTranslationManager.getAllTranslations()

    switch (category) {
      case "UI Elements":
        return this.getUIElementTranslations(allTranslations)
      case "Code Terms":
        return this.getCodeTermTranslations(allTranslations)
      case "Recent":
        return this.getRecentTranslations(allTranslations)
      default:
        return []
    }
  }

  private getUIElementTranslations(translations: UITranslation[]): TranslationItem[] {
    const uiTranslations = translations.filter((t) =>
      ["button", "label", "placeholder", "tooltip"].includes(t.context.elementType),
    )

    return uiTranslations.map((translation) => {
      const item = new TranslationItem(
        `${translation.originalText} → ${translation.translatedText}`,
        vscode.TreeItemCollapsibleState.None,
        "translation",
      )

      item.description = translation.context.elementType
      item.tooltip = `${translation.context.elementType} in ${translation.context.filePath}\nConfidence: ${Math.round(translation.confidence * 100)}%`
      item.command = {
        command: "codeTranslator.showTranslationDetails",
        title: "Show Details",
        arguments: [translation],
      }

      // Set icon based on element type
      switch (translation.context.elementType) {
        case "button":
          item.iconPath = new vscode.ThemeIcon("symbol-event")
          break
        case "label":
          item.iconPath = new vscode.ThemeIcon("symbol-string")
          break
        case "placeholder":
          item.iconPath = new vscode.ThemeIcon("symbol-text")
          break
        case "tooltip":
          item.iconPath = new vscode.ThemeIcon("info")
          break
      }

      return item
    })
  }

  private getCodeTermTranslations(translations: UITranslation[]): TranslationItem[] {
    // This would show regular code term translations
    // For now, return empty as we're focusing on UI translations
    return []
  }

  private getRecentTranslations(translations: UITranslation[]): TranslationItem[] {
    const recent = translations.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()).slice(0, 10)

    return recent.map((translation) => {
      const item = new TranslationItem(
        `${translation.originalText} → ${translation.translatedText}`,
        vscode.TreeItemCollapsibleState.None,
        "translation",
      )

      item.description = this.getRelativeTime(translation.lastUpdated)
      item.tooltip = `Last updated: ${translation.lastUpdated.toLocaleString()}`

      return item
    })
  }

  private getRelativeTime(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }
}

class TranslationItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly contextValue: string,
  ) {
    super(label, collapsibleState)
  }
}
