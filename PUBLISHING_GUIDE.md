# VS Code Marketplace Publishing Guide

This guide will walk you through the complete process of publishing your Code Translator extension to the Visual Studio Code Marketplace.

## Prerequisites

Before you begin, ensure you have:
- A Microsoft account (personal or work)
- Your extension properly packaged and tested
- All required files in place (package.json, README.md, etc.)

## Step 1: Create a Publisher Account

### 1.1 Visit the Marketplace Management Portal
Go to [Visual Studio Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)

### 1.2 Sign in with Microsoft Account
- Click "Sign in" and use your Microsoft account
- If you don't have one, create a Microsoft account first

### 1.3 Create a Publisher Profile
1. Click "Create publisher"
2. Fill in the required information:
   - **Publisher ID**: Choose a unique identifier (e.g., "yourname-dev", "companyname")
   - **Publisher display name**: Your display name (e.g., "John Doe", "Acme Corp")
   - **Description**: Brief description of who you are or your company
   - **Website**: Your website URL (optional but recommended)

### 1.4 Verify Your Account
- You may need to verify your account via email
- Complete any additional verification steps if prompted

## Step 2: Install and Configure VSCE

### 2.1 Install VSCE (Visual Studio Code Extension Manager)
\`\`\`bash
npm install -g @vscode/vsce
\`\`\`

### 2.2 Create a Personal Access Token (PAT)
1. Go to [Azure DevOps](https://dev.azure.com)
2. Sign in with the same Microsoft account
3. Click on your profile picture → "Personal access tokens"
4. Click "New Token"
5. Configure the token:
   - **Name**: "VS Code Extension Publishing"
   - **Organization**: Select "All accessible organizations"
   - **Expiration**: Choose appropriate duration (90 days recommended)
   - **Scopes**: Select "Custom defined" and check:
     - **Marketplace**: Manage

### 2.3 Login to VSCE
\`\`\`bash
vsce login your-publisher-id
\`\`\`
Enter your Personal Access Token when prompted.

## Step 3: Prepare Your Extension

### 3.1 Update package.json with Publisher Information
\`\`\`json
{
  "name": "code-translator",
  "displayName": "Code Translator",
  "description": "Real-time translation of non-English terms in code with IntelliSense-like interface",
  "version": "1.0.0",
  "publisher": "your-actual-publisher-id",
  "engines": {
    "vscode": "^1.74.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/code-translator.git"
  },
  "bugs": {
    "url": "https://github.com/your-username/code-translator/issues"
  },
  "homepage": "https://github.com/your-username/code-translator#readme",
  "license": "MIT"
}
\`\`\`

### 3.2 Create a Professional README
Your README.md should include:
- Clear description of what the extension does
- Installation instructions
- Usage examples with screenshots
- Configuration options
- Supported languages
- Changelog
- License information

### 3.3 Add Required Files
Ensure you have:
- ✅ `package.json` with all required fields
- ✅ `README.md` with comprehensive documentation
- ✅ `CHANGELOG.md` with version history
- ✅ `LICENSE` file
- ✅ Extension icon (128x128 PNG recommended)
- ✅ `.vscodeignore` to exclude unnecessary files

## Step 4: Test Your Extension Locally

### 4.1 Package the Extension
\`\`\`bash
# Compile TypeScript
npm run compile

# Package the extension
vsce package
\`\`\`

### 4.2 Install and Test Locally
\`\`\`bash
# Install the generated .vsix file
code --install-extension code-translator-1.0.0.vsix

# Test all functionality
# - Hover translations
# - Configuration options
# - Keyboard shortcuts
# - Different programming languages
\`\`\`

### 4.3 Validate Package Contents
\`\`\`bash
# List contents of the package
vsce ls
\`\`\`

## Step 5: Publish to Marketplace

### 5.1 Publish the Extension
\`\`\`bash
# Publish directly
vsce publish

# Or publish a pre-packaged .vsix file
vsce publish code-translator-1.0.0.vsix
\`\`\`

### 5.2 Verify Publication
1. Go to [VS Code Marketplace](https://marketplace.visualstudio.com/vscode)
2. Search for your extension
3. Verify all information is correct
4. Test installation from marketplace

## Step 6: Post-Publication Tasks

### 6.1 Update Your Repository
Add marketplace badges to your README:
\`\`\`markdown
[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/your-publisher-id.code-translator)](https://marketplace.visualstudio.com/items?itemName=your-publisher-id.code-translator)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/your-publisher-id.code-translator)](https://marketplace.visualstudio.com/items?itemName=your-publisher-id.code-translator)
[![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/your-publisher-id.code-translator)](https://marketplace.visualstudio.com/items?itemName=your-publisher-id.code-translator)
\`\`\`

### 6.2 Monitor and Respond
- Monitor reviews and ratings
- Respond to user feedback
- Track download statistics
- Plan future updates

## Step 7: Publishing Updates

### 7.1 Version Management
\`\`\`bash
# Patch version (1.0.0 → 1.0.1)
vsce publish patch

# Minor version (1.0.0 → 1.1.0)
vsce publish minor

# Major version (1.0.0 → 2.0.0)
vsce publish major

# Specific version
vsce publish 1.2.3
\`\`\`

### 7.2 Update Process
1. Make your changes
2. Update CHANGELOG.md
3. Test thoroughly
4. Commit changes
5. Publish update
6. Create GitHub release (optional)

## Troubleshooting Common Issues

### Issue: "Publisher not found"
**Solution**: Ensure you're logged in with the correct publisher ID
\`\`\`bash
vsce logout
vsce login your-correct-publisher-id
\`\`\`

### Issue: "Missing required fields"
**Solution**: Check package.json for required fields:
- name, displayName, description, version, publisher, engines

### Issue: "Icon not found"
**Solution**: Ensure icon file exists and is referenced correctly in package.json

### Issue: "Repository URL invalid"
**Solution**: Use full HTTPS URL format:
\`\`\`json
"repository": {
  "type": "git",
  "url": "https://github.com/username/repo.git"
}
\`\`\`

## Best Practices

### 1. Quality Assurance
- Test on multiple VS Code versions
- Test on different operating systems
- Validate all features work as expected
- Check for memory leaks or performance issues

### 2. Documentation
- Write clear, comprehensive README
- Include screenshots and GIFs
- Document all configuration options
- Provide troubleshooting section

### 3. Versioning
- Follow semantic versioning (semver)
- Update CHANGELOG.md for each release
- Tag releases in Git
- Consider pre-release versions for testing

### 4. User Experience
- Provide meaningful error messages
- Include progress indicators for long operations
- Respect user preferences and settings
- Follow VS Code UX guidelines

### 5. Security
- Never include sensitive data in the package
- Validate all user inputs
- Use secure APIs for external services
- Regular security updates

## Marketplace Policies

Ensure your extension complies with:
- [VS Code Marketplace Terms of Use](https://aka.ms/vsmarketplace-ToU)
- [Microsoft Publisher Agreement](https://aka.ms/vsmarketplace-agreement)
- Content guidelines and quality standards
- Privacy and data collection policies

## Support and Resources

- [VS Code Extension API Documentation](https://code.visualstudio.com/api)
- [Publishing Extensions Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Extension Marketplace](https://marketplace.visualstudio.com/vscode)
- [VS Code Extension Samples](https://github.com/Microsoft/vscode-extension-samples)

## Checklist Before Publishing

- [ ] Extension tested locally and works correctly
- [ ] All required files present (package.json, README, etc.)
- [ ] Publisher account created and verified
- [ ] Personal Access Token created and configured
- [ ] Repository is public and accessible
- [ ] Icon and branding materials ready
- [ ] Documentation is complete and accurate
- [ ] Version number is appropriate
- [ ] License is specified
- [ ] Extension follows VS Code guidelines

## Quick Commands Reference

\`\`\`bash
# Login to marketplace
vsce login your-publisher-id

# Package extension
vsce package

# Publish extension
vsce publish

# Publish with version bump
vsce publish patch|minor|major

# List package contents
vsce ls

# Show extension info
vsce show your-publisher-id.extension-name

# Unpublish extension (use with caution)
vsce unpublish your-publisher-id.extension-name
\`\`\`

Remember: Once published, your extension will be available to millions of VS Code users worldwide. Take time to ensure quality and provide good user experience!
