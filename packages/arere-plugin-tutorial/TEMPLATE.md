# Using This Template

This guide helps you customize this template to create your own arere plugin.

## Quick Start Checklist

After creating a repository from this template, follow these steps:

### 1. Update Package Information

Edit `package.json`:

```json
{
  "name": "arere-plugin-YOUR-NAME",  // Change this
  "version": "1.0.0",
  "description": "Your plugin description",  // Change this
  "keywords": ["arere-plugin"],  // Keep this
  "author": "Your Name",  // Change this
  "license": "MIT"
}
```

### 2. Update Plugin Metadata

Edit `src/index.ts`:

```typescript
const plugin: ArerePlugin = {
  meta: {
    name: 'arere-plugin-YOUR-NAME',  // Must match package.json name
    version: '1.0.0',
    description: 'Your plugin description',
    author: 'Your Name',
    i18nNamespace: 'your-namespace',  // Change this (e.g., 'git', 'docker')
  },
  actions: [
    // Add your action paths here
  ],
  locales: 'locales',  // Keep this if using i18n
}
```

### 3. Create Your Actions

In the `actions/` directory:

1. Delete demo actions or use them as reference:
   - `demo-plugin-i18n.ts` - i18n example
   - `demo-plugin-external-deps.ts` - external dependency example

2. Create your own actions:

```typescript
// actions/your-action.ts
import { defineAction } from 'arere'

export default defineAction({
  name: 'your-action-name',
  description: 'What your action does',
  async run({ prompt, $, t }) {
    // Your action logic here
  },
})
```

3. Update `src/index.ts` to reference your actions:

```typescript
actions: [
  'actions/your-action-1.ts',
  'actions/your-action-2.ts',
],
```

### 4. Update Translations (if using i18n)

If your plugin needs i18n support:

1. Update `locales/en/translation.json` with your English translations
2. Update `locales/ja/translation.json` with your Japanese translations
3. Use the same keys in both files

Example:

```json
{
  "your_key": "Your translated text",
  "greeting": "Hello",
  "actions": {
    "confirm": "Are you sure?"
  }
}
```

If you don't need i18n:

- Delete the `locales/` directory
- Remove `locales: 'locales'` from `src/index.ts`
- Remove `i18nNamespace` from plugin meta

### 5. Update Dependencies

If you need external dependencies:

```bash
npm install your-package
```

Update `package.json`:

```json
{
  "dependencies": {
    "your-package": "^1.0.0"
  }
}
```

If you don't need external dependencies:

- Remove unnecessary packages from `package.json`

### 6. Update README

Edit `README.md`:

1. Change the title to your plugin name
2. Update the description
3. Remove the "Use as Template" section
4. Document your actions
5. Add usage examples
6. Update installation instructions

### 7. Build and Test

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Test locally by linking
npm link
```

Then in a test project:

```bash
npm link arere-plugin-YOUR-NAME
```

### 8. Optional: Delete This File

Once you've completed the customization, you can delete `TEMPLATE.md`.

## Project Structure

```
arere-plugin-YOUR-NAME/
├── package.json                  # Update: name, description, author
├── src/
│   └── index.ts                 # Update: plugin meta, action paths
├── actions/
│   ├── demo-plugin-i18n.ts      # Reference: i18n example (delete/modify)
│   ├── demo-plugin-external-deps.ts  # Reference: dependency example (delete/modify)
│   └── your-action.ts           # Create: your custom actions
├── locales/                     # Optional: for i18n support
│   ├── en/
│   │   └── translation.json
│   └── ja/
│       └── translation.json
├── .gitignore                   # Keep as is
├── tsconfig.json                # Keep as is
├── tsup.config.ts               # Keep as is
├── README.md                    # Update completely
└── TEMPLATE.md                  # Delete after setup
```

## Additional Resources

- [arere Plugin API Documentation](https://github.com/yudai-nkt/arere/blob/main/docs/api/plugin.md)
- [Action Development Guide](https://github.com/yudai-nkt/arere/blob/main/docs/ja/guides/creating-actions.md)
- [i18n Guide](https://github.com/yudai-nkt/arere/blob/main/docs/i18n-guide.md)

## Publishing Your Plugin

When you're ready to publish:

```bash
# Build the plugin
npm run build

# Test the package contents
npm pack

# Login to npm (first time only)
npm login

# Publish to npm
npm publish --access public
```

Make sure to:
- Set `"files": ["dist", "actions", "locales"]` in package.json
- Include `"prepublishOnly": "npm run build"` in actions
- Follow semantic versioning for version numbers
