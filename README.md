# Code Translator Extension (Made with Vercel)

A Visual Studio Code extension that provides real-time translation of non-English terms within the code editor, similar to IntelliSense functionality.

## Features

- **Real-time Translation**: Hover over non-English words to see instant translations
- **IntelliSense Integration**: Get translation suggestions as you type
- **Context-Aware**: Understands different code contexts (comments, strings, identifiers)
- **Multi-Language Support**: Works with various programming languages
- **Customizable**: Configure source/target languages and translation preferences
- **Performance Optimized**: Built-in caching system for fast translations

## Usage

### Basic Usage

1. Install the extension
2. Open any code file with non-English text
3. Hover over non-English words to see translations
4. Use `Ctrl+Shift+T` (or `Cmd+Shift+T` on Mac) to toggle the extension

### Configuration

Access settings via:
- Command Palette: `Code Translator: Configure Languages`
- VS Code Settings: Search for "Code Translator"

### Available Settings

- **Enable/Disable**: Toggle the extension on/off
- **Target Language**: Set your preferred translation language
- **Context Options**: Choose what to translate (comments, strings, identifiers)
- **Minimum Word Length**: Set minimum length for translation candidates
- **Hover Delay**: Adjust delay before showing translations

## Supported Languages

### Programming Languages
- JavaScript/TypeScript
- Python
- Java
- C#
- C/C++
- Go
- Rust
- PHP
- Ruby
- Swift
- Kotlin
- Scala
- HTML/CSS
- And more...

### Translation Languages
- English
- Spanish
- French
- German
- Italian
- Portuguese
- Russian
- Chinese (Simplified)
- Japanese
- Korean

## Commands

- `Code Translator: Toggle` - Enable/disable the extension
- `Code Translator: Configure Languages` - Open language configuration
- `Code Translator: Clear Translation Cache` - Clear cached translations

## Keyboard Shortcuts

- `Ctrl+Shift+T` (Windows/Linux) / `Cmd+Shift+T` (Mac) - Toggle extension

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Code Translator"
4. Click Install

## Development

To set up the development environment:

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd code-translator

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Changelog

### 1.0.0
- Initial release
- Real-time translation with hover
- IntelliSense-like completion
- Multi-language support
- Configurable settings
- Context-aware translation

## Support

For issues and feature requests, please visit our [GitHub repository](https://github.com/ash-norsidi/real-time-code-translation).
