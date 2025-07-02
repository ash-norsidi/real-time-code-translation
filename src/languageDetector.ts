import type * as vscode from "vscode"

export interface CodeContext {
  isComment: boolean
  isString: boolean
  isIdentifier: boolean
  language: string
}

export class LanguageDetector {
  detectContext(document: vscode.TextDocument, position: vscode.Position): CodeContext {
    const line = document.lineAt(position.line)
    const lineText = line.text
    const character = position.character

    return {
      isComment: this.isInComment(lineText, character, document.languageId),
      isString: this.isInString(lineText, character),
      isIdentifier: this.isIdentifier(lineText, character),
      language: document.languageId,
    }
  }

  private isInComment(lineText: string, character: number, languageId: string): boolean {
    const commentPatterns: { [key: string]: string[] } = {
      javascript: ["//", "/*", "*/"],
      typescript: ["//", "/*", "*/"],
      python: ["#"],
      java: ["//", "/*", "*/"],
      csharp: ["//", "/*", "*/"],
      cpp: ["//", "/*", "*/"],
      c: ["//", "/*", "*/"],
      go: ["//", "/*", "*/"],
      rust: ["//", "/*", "*/"],
      php: ["//", "#", "/*", "*/"],
      ruby: ["#"],
      swift: ["//", "/*", "*/"],
      kotlin: ["//", "/*", "*/"],
      scala: ["//", "/*", "*/"],
      html: ["<!--", "-->"],
      css: ["/*", "*/"],
      scss: ["//", "/*", "*/"],
      less: ["//", "/*", "*/"],
    }

    const patterns = commentPatterns[languageId] || ["//", "/*", "*/"]

    // Check for single-line comments
    for (const pattern of patterns) {
      if (pattern === "//" || pattern === "#") {
        const commentStart = lineText.indexOf(pattern)
        if (commentStart !== -1 && character >= commentStart) {
          return true
        }
      }
    }

    // For multi-line comments, this is a simplified check
    // A full implementation would need to track comment blocks across lines
    const beforeCursor = lineText.substring(0, character)
    const afterCursor = lineText.substring(character)

    if (beforeCursor.includes("/*") && !beforeCursor.includes("*/")) {
      return true
    }

    if (beforeCursor.includes("<!--") && !beforeCursor.includes("-->")) {
      return true
    }

    return false
  }

  private isInString(lineText: string, character: number): boolean {
    let inSingleQuote = false
    let inDoubleQuote = false
    let inBacktick = false
    let escaped = false

    for (let i = 0; i < character; i++) {
      const char = lineText[i]

      if (escaped) {
        escaped = false
        continue
      }

      if (char === "\\") {
        escaped = true
        continue
      }

      if (char === "'" && !inDoubleQuote && !inBacktick) {
        inSingleQuote = !inSingleQuote
      } else if (char === '"' && !inSingleQuote && !inBacktick) {
        inDoubleQuote = !inDoubleQuote
      } else if (char === "`" && !inSingleQuote && !inDoubleQuote) {
        inBacktick = !inBacktick
      }
    }

    return inSingleQuote || inDoubleQuote || inBacktick
  }

  private isIdentifier(lineText: string, character: number): boolean {
    const char = lineText[character]
    if (!char) return false

    // Check if current character is part of an identifier
    const identifierRegex = /[a-zA-Z_$][a-zA-Z0-9_$]*/

    // Find the word boundaries around the current position
    let start = character
    let end = character

    // Find start of word
    while (start > 0 && /[a-zA-Z0-9_$]/.test(lineText[start - 1])) {
      start--
    }

    // Find end of word
    while (end < lineText.length && /[a-zA-Z0-9_$]/.test(lineText[end])) {
      end++
    }

    const word = lineText.substring(start, end)
    return identifierRegex.test(word) && word.length > 0
  }

  getWordAtPosition(document: vscode.TextDocument, position: vscode.Position): string {
    const range = document.getWordRangeAtPosition(position)
    return range ? document.getText(range) : ""
  }

  isNonEnglishText(text: string): boolean {
    // Simple heuristic to detect non-English text
    // This could be improved with more sophisticated language detection
    const englishPattern = /^[a-zA-Z0-9\s\-_.,!?;:()[\]{}'"]*$/

    if (englishPattern.test(text)) {
      // Check for common English programming keywords
      const commonKeywords = [
        "function",
        "class",
        "method",
        "variable",
        "const",
        "let",
        "var",
        "if",
        "else",
        "for",
        "while",
        "do",
        "return",
        "import",
        "export",
        "true",
        "false",
        "null",
        "undefined",
        "string",
        "number",
        "boolean",
      ]

      return !commonKeywords.includes(text.toLowerCase())
    }

    return true
  }
}
