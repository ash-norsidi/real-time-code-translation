export interface UITranslation {
  key: string
  originalText: string
  translatedText: string
  context: UIContext
  language: string
  confidence: number
  lastUpdated: Date
}

export interface UIContext {
  elementType: "button" | "label" | "placeholder" | "tooltip" | "menu" | "dialog" | "notification"
  parentElement?: string
  framework?: "react" | "vue" | "angular" | "html" | "jsx" | "tsx"
  filePath: string
}

export interface TranslationRule {
  pattern: RegExp
  elementType: UIContext["elementType"]
  framework: UIContext["framework"]
  extractor: (match: RegExpMatchArray, content: string) => string[]
}

export class UITranslationManager {
  private translations: Map<string, UITranslation> = new Map()
  private translationRules: TranslationRule[] = []
  private cache: Map<string, UITranslation[]> = new Map()

  constructor() {
    this.initializeTranslationRules()
  }

  private initializeTranslationRules() {
    // React/JSX patterns
    this.translationRules.push(
      // Button labels: <button>Text</button>
      {
        pattern: /<button[^>]*>([^<]+)<\/button>/gi,
        elementType: "button",
        framework: "react",
        extractor: (match) => [match[1].trim()],
      },
      // Input placeholders: placeholder="Text"
      {
        pattern: /placeholder=["']([^"']+)["']/gi,
        elementType: "placeholder",
        framework: "react",
        extractor: (match) => [match[1]],
      },
      // Label elements: <label>Text</label>
      {
        pattern: /<label[^>]*>([^<]+)<\/label>/gi,
        elementType: "label",
        framework: "react",
        extractor: (match) => [match[1].trim()],
      },
      // Title attributes: title="Text"
      {
        pattern: /title=["']([^"']+)["']/gi,
        elementType: "tooltip",
        framework: "react",
        extractor: (match) => [match[1]],
      },
      // Alt attributes: alt="Text"
      {
        pattern: /alt=["']([^"']+)["']/gi,
        elementType: "label",
        framework: "react",
        extractor: (match) => [match[1]],
      },
    )

    // Vue.js patterns
    this.translationRules.push(
      // Vue button with v-text or content
      {
        pattern: /<button[^>]*>([^<]+)<\/button>/gi,
        elementType: "button",
        framework: "vue",
        extractor: (match) => [match[1].trim()],
      },
      // Vue v-placeholder
      {
        pattern: /v-placeholder=["']([^"']+)["']/gi,
        elementType: "placeholder",
        framework: "vue",
        extractor: (match) => [match[1]],
      },
    )

    // Angular patterns
    this.translationRules.push(
      // Angular interpolation: {{text}}
      {
        pattern: /\{\{([^}]+)\}\}/gi,
        elementType: "label",
        framework: "angular",
        extractor: (match) => [match[1].trim()],
      },
      // Angular property binding: [placeholder]="'text'"
      {
        pattern: /\[placeholder\]=["']([^"']+)["']/gi,
        elementType: "placeholder",
        framework: "angular",
        extractor: (match) => [match[1]],
      },
    )

    // HTML patterns
    this.translationRules.push(
      // Form labels
      {
        pattern: /<label[^>]*for=["']([^"']+)["'][^>]*>([^<]+)<\/label>/gi,
        elementType: "label",
        framework: "html",
        extractor: (match) => [match[2].trim()],
      },
      // Submit buttons
      {
        pattern: /<input[^>]*type=["']submit["'][^>]*value=["']([^"']+)["']/gi,
        elementType: "button",
        framework: "html",
        extractor: (match) => [match[1]],
      },
    )
  }

  async extractUITerms(content: string, filePath: string): Promise<UITranslation[]> {
    const cacheKey = `${filePath}:${this.hashContent(content)}`

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const extractedTerms: UITranslation[] = []
    const framework = this.detectFramework(filePath, content)

    for (const rule of this.translationRules) {
      if (rule.framework && rule.framework !== framework) {
        continue
      }

      let match
      while ((match = rule.pattern.exec(content)) !== null) {
        const texts = rule.extractor(match, content)

        for (const text of texts) {
          if (this.shouldTranslate(text)) {
            const translation: UITranslation = {
              key: this.generateKey(text, rule.elementType, filePath),
              originalText: text,
              translatedText: text, // Will be updated by translation service
              context: {
                elementType: rule.elementType,
                framework: rule.framework,
                filePath: filePath,
              },
              language: "auto",
              confidence: 0,
              lastUpdated: new Date(),
            }
            extractedTerms.push(translation)
          }
        }
      }
    }

    this.cache.set(cacheKey, extractedTerms)
    return extractedTerms
  }

  private detectFramework(filePath: string, content: string): UIContext["framework"] {
    const extension = filePath.split(".").pop()?.toLowerCase()

    switch (extension) {
      case "jsx":
      case "tsx":
        return "react"
      case "vue":
        return "vue"
      case "html":
        if (content.includes("ng-") || content.includes("[") || content.includes("{{")) {
          return "angular"
        }
        return "html"
      case "js":
      case "ts":
        if (content.includes("React") || content.includes("jsx")) {
          return "react"
        }
        break
    }

    return "html"
  }

  private shouldTranslate(text: string): boolean {
    // Skip if text is too short
    if (text.length < 2) return false

    // Skip if text contains only numbers or special characters
    if (!/[a-zA-ZÀ-ÿ]/.test(text)) return false

    // Skip common English words that don't need translation
    const commonEnglishWords = [
      "ok",
      "cancel",
      "yes",
      "no",
      "save",
      "delete",
      "edit",
      "add",
      "remove",
      "submit",
      "reset",
      "close",
      "open",
      "search",
      "filter",
      "sort",
      "help",
    ]

    if (commonEnglishWords.includes(text.toLowerCase())) return false

    // Check if text contains non-English characters
    const hasNonEnglish = /[À-ÿĀ-žА-я\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/.test(text)

    return hasNonEnglish || this.isLikelyNonEnglish(text)
  }

  private isLikelyNonEnglish(text: string): boolean {
    // Simple heuristic to detect non-English text patterns
    const nonEnglishPatterns = [
      /ción$/, // Spanish -ción endings
      /ment$/, // French -ment endings
      /ung$/, // German -ung endings
      /iteit$/, // Dutch -iteit endings
      /ство$/, // Russian -ство endings
    ]

    return nonEnglishPatterns.some((pattern) => pattern.test(text.toLowerCase()))
  }

  private generateKey(text: string, elementType: string, filePath: string): string {
    const fileName =
      filePath
        .split("/")
        .pop()
        ?.replace(/\.[^.]+$/, "") || "unknown"
    const sanitizedText = text.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()
    return `${fileName}_${elementType}_${sanitizedText}`
  }

  private hashContent(content: string): string {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }

  async translateUITerms(terms: UITranslation[], targetLanguage: string): Promise<UITranslation[]> {
    const translatedTerms: UITranslation[] = []

    for (const term of terms) {
      try {
        // Use existing translation provider
        const translation = await this.getTranslationService().translate(term.originalText, targetLanguage, "auto")

        if (translation && translation.confidence > 0.5) {
          const translatedTerm: UITranslation = {
            ...term,
            translatedText: translation.translatedText,
            language: translation.targetLanguage,
            confidence: translation.confidence,
            lastUpdated: new Date(),
          }

          translatedTerms.push(translatedTerm)
          this.translations.set(term.key, translatedTerm)
        }
      } catch (error) {
        console.error(`Failed to translate UI term: ${term.originalText}`, error)
      }
    }

    return translatedTerms
  }

  private getTranslationService() {
    // This would be injected or imported from the main translation provider
    return {
      translate: async (text: string, targetLang: string, sourceLang: string) => {
        // Mock implementation - replace with actual service
        return {
          originalText: text,
          translatedText: this.getMockUITranslation(text, targetLang),
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          confidence: 0.9,
        }
      },
    }
  }

  private getMockUITranslation(text: string, targetLang: string): string {
    const uiTranslations: { [key: string]: { [lang: string]: string } } = {
      // Common UI terms
      guardar: { en: "save", nl: "opslaan", fr: "enregistrer" },
      cancelar: { en: "cancel", nl: "annuleren", fr: "annuler" },
      eliminar: { en: "delete", nl: "verwijderen", fr: "supprimer" },
      editar: { en: "edit", nl: "bewerken", fr: "modifier" },
      buscar: { en: "search", nl: "zoeken", fr: "rechercher" },
      filtrar: { en: "filter", nl: "filteren", fr: "filtrer" },
      ordenar: { en: "sort", nl: "sorteren", fr: "trier" },
      ayuda: { en: "help", nl: "help", fr: "aide" },

      // Dutch UI terms
      opslaan: { en: "save", es: "guardar", fr: "enregistrer" },
      annuleren: { en: "cancel", es: "cancelar", fr: "annuler" },
      verwijderen: { en: "delete", es: "eliminar", fr: "supprimer" },
      bewerken: { en: "edit", es: "editar", fr: "modifier" },
      zoeken: { en: "search", es: "buscar", fr: "rechercher" },
      toevoegen: { en: "add", es: "añadir", fr: "ajouter" },
      sluiten: { en: "close", es: "cerrar", fr: "fermer" },
      openen: { en: "open", es: "abrir", fr: "ouvrir" },

      // Form labels
      naam: { en: "name", es: "nombre", fr: "nom" },
      email: { en: "email", es: "correo", fr: "courriel" },
      wachtwoord: { en: "password", es: "contraseña", fr: "mot de passe" },
      gebruikersnaam: { en: "username", es: "usuario", fr: "nom d'utilisateur" },
      telefoon: { en: "phone", es: "teléfono", fr: "téléphone" },
      adres: { en: "address", es: "dirección", fr: "adresse" },

      // French UI terms
      enregistrer: { en: "save", es: "guardar", nl: "opslaan" },
      annuler: { en: "cancel", es: "cancelar", nl: "annuleren" },
      supprimer: { en: "delete", es: "eliminar", nl: "verwijderen" },
      modifier: { en: "edit", es: "editar", nl: "bewerken" },
      rechercher: { en: "search", es: "buscar", nl: "zoeken" },
      ajouter: { en: "add", es: "añadir", nl: "toevoegen" },
      fermer: { en: "close", es: "cerrar", nl: "sluiten" },
      ouvrir: { en: "open", es: "abrir", nl: "openen" },
    }

    const lowerText = text.toLowerCase()
    return uiTranslations[lowerText]?.[targetLang] || text
  }

  getTranslation(key: string): UITranslation | undefined {
    return this.translations.get(key)
  }

  getAllTranslations(): UITranslation[] {
    return Array.from(this.translations.values())
  }

  clearCache() {
    this.cache.clear()
  }

  exportTranslations(): string {
    const translations = this.getAllTranslations()
    return JSON.stringify(translations, null, 2)
  }

  importTranslations(jsonData: string): void {
    try {
      const translations: UITranslation[] = JSON.parse(jsonData)
      for (const translation of translations) {
        this.translations.set(translation.key, translation)
      }
    } catch (error) {
      console.error("Failed to import translations:", error)
    }
  }
}
