# Code Translator Extension

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/REPLACE-WITH-YOUR-PUBLISHER-ID.code-translator)](https://marketplace.visualstudio.com/items?itemName=REPLACE-WITH-YOUR-PUBLISHER-ID.code-translator)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/REPLACE-WITH-YOUR-PUBLISHER-ID.code-translator)](https://marketplace.visualstudio.com/items?itemName=REPLACE-WITH-YOUR-PUBLISHER-ID.code-translator)
[![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/REPLACE-WITH-YOUR-PUBLISHER-ID.code-translator)](https://marketplace.visualstudio.com/items?itemName=REPLACE-WITH-YOUR-PUBLISHER-ID.code-translator)

A Visual Studio Code extension that provides real-time translation of non-English terms within the code editor, similar to IntelliSense functionality.

## ✨ Features

- **🔄 Real-time Translation**: Hover over non-English words to see instant translations
- **💡 IntelliSense Integration**: Get translation suggestions as you type
- **🎯 Context-Aware**: Understands different code contexts (comments, strings, identifiers)
- **🌍 Multi-Language Support**: Works with 20+ programming languages
- **⚙️ Customizable**: Configure source/target languages and translation preferences
- **⚡ Performance Optimized**: Built-in caching system for fast translations

## 🚀 Quick Start

1. **Install the extension** from the VS Code Marketplace
2. **Open any code file** with non-English text
3. **Hover over non-English words** to see translations
4. **Use `Ctrl+Shift+T`** (or `Cmd+Shift+T` on Mac) to toggle the extension

## 📖 Usage

### Basic Translation
Simply hover over any non-English word in your code to see its translation:

```javascript
// Spanish code example
function calcularPrecio(precio, impuesto) {
    // Hover over 'calcularPrecio', 'precio', 'impuesto' to see translations
    return precio * (1 + impuesto);
}
```

### Configuration
Access settings via:
- **Command Palette**: `Code Translator: Configure Languages`
- **VS Code Settings**: Search for "Code Translator"

### Available Commands
- `Code Translator: Toggle` - Enable/disable the extension
- `Code Translator: Configure Languages` - Open language configuration
- `Code Translator: Clear Translation Cache` - Clear cached translations

## ⚙️ Configuration Options

| Setting | Default | Description |
|---------|---------|-------------|
| `codeTranslator.enabled` | `true` | Enable/disable the extension |
| `codeTranslator.targetLanguage` | `"en"` | Target language for translations |
| `codeTranslator.translateComments` | `true` | Enable translation of comments |
| `codeTranslator.translateStrings` | `true` | Enable translation of string literals |
| `codeTranslator.translateIdentifiers` | `false` | Enable translation of variable/function names |
| `codeTranslator.minWordLength` | `3` | Minimum word length to translate |
| `codeTranslator.hoverDelay` | `500` | Delay in milliseconds before showing translations |

## 🌐 Supported Languages

### Programming Languages
JavaScript, TypeScript, Python, Java, C#, C/C++, Go, Rust, PHP, Ruby, Swift, Kotlin, Scala, HTML, CSS, and more...

### Translation Languages
- English
- Spanish
- French
- German
- **Dutch** 🇳🇱
- Italian
- Portuguese
- Russian
- Chinese (Simplified)
- Japanese
- Korean

## 🎯 Use Cases

- **International Teams**: Understand code written by team members in different languages
- **Learning**: Learn programming concepts in multiple languages
- **Code Review**: Review code with non-English comments and variable names
- **Documentation**: Understand inline documentation in foreign languages

## 🔧 Development

### Prerequisites
- Node.js 18+
- VS Code 1.74+

### Setup
```bash
git clone https://github.com/your-username/code-translator.git
cd code-translator
npm install
npm run compile
```

### Testing
```
# Run tests
npm test

# Package extension
npm run package

# Install locally
code --install-extension code-translator-1.0.0.vsix
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/your-username/code-translator/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/your-username/code-translator/discussions)
- **Support**: [VS Code Extension Support](https://code.visualstudio.com/docs/editor/extension-gallery#_extension-details)

## 📊 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

## 🙏 Acknowledgments

- VS Code Extension API team
- Translation service providers
- Open source community contributors

---

**Enjoy coding in multiple languages!** 🌍✨


```text file="LICENSE"
MIT License

Copyright (c) 2024 Code Translator Extension

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
