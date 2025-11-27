# arere-plugin-tutorial

> Tutorial plugin for arere - demonstrates basic usage, i18n, and external dependencies

[Japanese](./README.ja.md) | English

## Features

This plugin demonstrates two key features of the arere plugin system:

1. **i18n Support** - Multi-language support using translation files
2. **External Dependencies** - Using npm packages (date-fns) in plugin actions

## Use as Template

This repository can be used as a template to create your own arere plugin.

### Option 1: Using GitHub Template (Recommended)

If this repository is published on GitHub with template repository enabled:

1. Click the **"Use this template"** button at the top of the repository page
2. Select **"Create a new repository"**
3. Enter your plugin details:
   - Repository name: `arere-plugin-your-name`
   - Description: Your plugin description
   - Choose public or private visibility
4. Click **"Create repository from template"**

Your new repository will have a clean commit history and all the files from this template.

**📝 Next Steps:** After creating from template, see [TEMPLATE.md](./TEMPLATE.md) for detailed customization guide.

### Option 2: Manual Clone

```bash
# Clone this repository
git clone https://github.com/your-org/arere-plugin-tutorial.git arere-plugin-your-name
cd arere-plugin-your-name

# Remove the original git history
rm -rf .git
git init

# Update package.json
# - Change "name" to "arere-plugin-your-name"
# - Update "description", "author", etc.

# Update src/index.ts
# - Change plugin meta information
# - Update i18nNamespace

# Install dependencies
npm install

# Start developing
npm run dev
```

### Setting Up Template Repository (For Maintainers)

To enable the "Use this template" button on GitHub:

1. Go to the repository **Settings**
2. Scroll to the **Template repository** section
3. Check the ✅ **Template repository** checkbox
4. Save changes

The green **"Code"** button will change to **"Use this template"**.

## Installation

```bash
npm install arere-plugin-tutorial
```

## Configuration

Add to your `.arere/settings.json`:

```json
{
  "plugins": {
    "arere-plugin-tutorial": true
  }
}
```

## Actions

### demo-plugin-i18n

Demonstrates i18n (internationalization) support in plugins.

- Uses translation keys with plugin namespace
- Supports both English and Japanese
- Shows how to use `t()` function for translations
- Interactive prompts with i18n support

### demo-plugin-external-deps

Demonstrates using external dependencies (date-fns).

- Format dates in various styles
- Use external npm packages in plugin actions
- Interactive date formatting options
- Practical example of dependency management

## Development

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Watch mode
npm run dev
```

## Project Structure

```
arere-plugin-tutorial/
├── package.json
├── src/
│   └── index.ts                      # Plugin definition
├── actions/
│   ├── demo-plugin-i18n.ts           # i18n demonstration
│   └── demo-plugin-external-deps.ts  # External dependency demo
├── locales/
│   ├── en/
│   │   └── translation.json
│   └── ja/
│       └── translation.json
└── README.md
```

## License

MIT
