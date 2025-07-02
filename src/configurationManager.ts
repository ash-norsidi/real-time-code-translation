import * as vscode from "vscode"

export interface ExtensionConfiguration {
  enabled: boolean
  sourceLanguages: string[]
  targetLanguage: string
  translateComments: boolean
  translateStrings: boolean
  translateIdentifiers: boolean
  minWordLength: number
  hoverDelay: number
}

export class ConfigurationManager {
  getConfiguration(): ExtensionConfiguration {
    const config = vscode.workspace.getConfiguration("codeTranslator")

    return {
      enabled: config.get<boolean>("enabled", true),
      sourceLanguages: config.get<string[]>("sourceLanguages", ["auto"]),
      targetLanguage: config.get<string>("targetLanguage", "en"),
      translateComments: config.get<boolean>("translateComments", true),
      translateStrings: config.get<boolean>("translateStrings", true),
      translateIdentifiers: config.get<boolean>("translateIdentifiers", false),
      minWordLength: config.get<number>("minWordLength", 3),
      hoverDelay: config.get<number>("hoverDelay", 500),
    }
  }

  async updateConfiguration(
    key: string,
    value: any,
    target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global,
  ) {
    const config = vscode.workspace.getConfiguration("codeTranslator")
    await config.update(key, value, target)
  }

  onConfigurationChanged(callback: () => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("codeTranslator")) {
        callback()
      }
    })
  }
}
