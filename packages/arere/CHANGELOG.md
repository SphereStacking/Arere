# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.7] - 2025-11-30

### Changes

- fix: remove arere-plugin- prefix from category label display (#24)

## [0.1.6] - 2025-11-30

### Changes

- feat: add CLI args support to ActionContext
- fix: resolve lint errors and add release documentation

## [0.1.5] - 2025-11-29

### Changed

#### i18n System Improvements
- **Unified API** - All translation keys now use `namespace:key` format (e.g., `ui:breadcrumb.home`)
- **defaultValue Support** - Added `defaultValue` option for fallback when translation is missing
- **Removed `ns` Option** - Deprecated `ns` option in favor of unified `namespace:key` format

### Fixed

#### Clean Architecture Compliance
- **Layer Violation Fix** - Removed direct `translationManager` imports from Presentation layer
- **Breadcrumb Refactor** - Translation responsibility moved to callers, Header now just displays values
- **Plugin Config** - Uses Zod schema `description` directly instead of dynamic translation lookup

### Technical
- **1072 Tests Passing** - All tests updated and passing
- **Simplified i18n** - Reduced complexity in scoped translation function

## [0.1.4] - 2025-11-29

### Added

#### ArereRender - Customizable Action List Format
- **VSCode-style Template Syntax** - Use `${variable:modifier}` format strings for action list display
- **Available Variables** - `selectIcon`, `bookmark`, `category`, `name`, `description`, `tags`, `plugin`, `source`
- **Width Modifiers** - `:max` (align to max width), `:width(N)` (fixed width with truncation)
- **Alignment Modifiers** - `:left`, `:right`, `:center`
- **Stretch Modifiers** - `:grow` (fill remaining space), `:shrink` (truncate when needed)
- **Style Modifiers** - `:dim` (dim when not selected), `:primary` (use primary color)
- **Config Option** - `ui.actionListFormat` to customize action list appearance

#### Bookmark Feature
- **Action Bookmarking** - Toggle bookmarks with Tab key
- **Bookmark Icon** - Configurable via `ui.bookmarkIcon` (default: `♥`)
- **Persistent Bookmarks** - Stored in settings.json as `bookmarks` array

### Changed
- **Variable Rename** - `prefix` renamed to `selectIcon` for clarity
- **Layout Margin** - Reduced from 5 to 2 for better scrollbar alignment

### Technical
- **1072 Tests Passing** - Comprehensive test coverage maintained
- **Clean Architecture** - ArereRender follows domain-driven design with parser, layout engine, and types

## [0.1.0] - 2025-11-25

### Initial Release

The first public release of Arere - a TypeScript-based persistent terminal launcher with fuzzy search, plugins, and i18n support.

### Added

#### Core Features
- **Persistent Terminal Launcher** - Interactive TUI that stays running for continuous action execution
- **Fuzzy Search** - Fast action discovery using fuzzysort with keyboard-driven navigation
- **TypeScript Actions** - Write actions in TypeScript with runtime transpilation (jiti)
- **Action Loading System** - Automatic discovery and loading from `.arere/` directories
- **Action Priority System** - Last-wins strategy: plugin > global > project actions
- **Hot Reload** - Automatic action reloading on file changes

#### Plugin System
- **NPM-Based Plugins** - Install and share actions as npm packages (`arere-plugin-*`)
- **Plugin Auto-Detection** - Automatic discovery of installed plugins
- **Plugin Configuration** - User-configurable plugin settings with Zod validation
- **Plugin i18n** - Plugins can provide their own translations
- **Hot Plugin Management** - Enable/disable plugins without restarting

#### Interactive UI (React/Ink)
- **Action List View** - Browse available actions with categories and tags
- **Search Mode** - Full-screen fuzzy search with real-time filtering
- **Settings UI** - Interactive configuration editor with layer selection
- **Plugin Management UI** - Browse, enable/disable, and configure plugins
- **Help Screen** - Keyboard shortcuts and usage guide
- **Execution Feedback** - Real-time action execution status with spinner
- **Error Handling** - User-friendly error messages and recovery

#### Configuration System
- **Two-Layer Config** - VSCode-style workspace (`.arere/settings.json`) + user (`~/.arere/settings.json`)
- **Config Priority** - Workspace overrides user overrides defaults
- **Partial Save** - Only changed keys written to config files
- **Nested Key Support** - Dot notation for nested config values (`theme.primaryColor`)
- **Layer Selector UI** - Switch between User/Workspace layers with left/right arrow keys
- **Override Detection** - Visual indicators for overridden settings
- **Zod Validation** - Runtime config validation with type safety

#### Internationalization (i18n)
- **Multi-Language Support** - English and Japanese built-in
- **i18next Integration** - Namespace-based translation system
- **Type-Safe Translations** - Auto-generated TypeScript types from JSON
- **Dynamic Registration** - Plugins and actions can add translations at runtime
- **Locale Auto-Detection** - Uses system locale with fallback to English

#### Prompt System
- **Text Input** - Single-line text prompts with validation
- **Select Menu** - Single-choice selection from options
- **Multi-Select** - Multiple-choice selection with checkboxes
- **Confirm Dialog** - Yes/No confirmation prompts
- **Password Input** - Masked password entry
- **Two-Layer Architecture** - Synchronous API for actions, async implementation for UI

#### Shell Execution
- **Tagged Template Literals** - Safe shell command execution with `$\`command\``
- **Automatic Escaping** - Safe variable interpolation in commands
- **Result Objects** - Returns `{ stdout, stderr, exitCode }` instead of throwing
- **Error Handling** - Actions can handle command failures gracefully

#### Terminal Multiplexer Integration
- **Tmux Support** - Split panes for long-running tasks
- **Zellij Support** - Create panes with configurable layout
- **Auto-Detection** - Detects terminal multiplexer environment

#### Development Tools
- **TypeScript Strict Mode** - Full type safety throughout codebase
- **ESM Modules** - ES modules only, no CommonJS
- **Path Aliases** - `@/*` → `./src/*` for clean imports
- **Biome Integration** - Fast linting and formatting
- **Vitest** - Fast unit tests with coverage reporting
- **Ink Testing Library** - UI component testing support

#### Testing & Quality
- **780 Tests Passing** - Comprehensive test coverage across all layers
- **90%+ Code Coverage** - High coverage target maintained
- **TDD Approach** - Test-driven development following @t_wada patterns
- **Layer Testing** - Dedicated tests for each architectural layer
- **UI Testing** - Keyboard interaction and rendering tests

#### Architecture
- **Layered Architecture** - Clear separation: Core → Domain → Infrastructure → Application → Presentation
- **Dependency Rule** - Inner layers independent of outer layers
- **Single Responsibility** - Each layer has focused, well-defined responsibilities
- **Testability** - Architecture designed for easy unit testing
- **File Organization** - Logical structure mirroring architectural layers

#### Documentation
- **User Guides** - Getting started, action creation, plugin development
- **API Reference** - Complete API documentation for all public APIs
- **Architecture Guide** - Detailed explanation of Clean Architecture implementation
- **Testing Guide** - TDD principles and testing patterns
- **Migration Guide** - Prepared for future v1.0 migration
- **VitePress Docs** - Full documentation site with search

#### GitHub Actions Integration
- **CI/CD in TypeScript** - Replace bash scripts with type-safe actions
- **Local Testing** - Test CI workflows locally before pushing
- **Reusable Actions** - Same actions work in local and CI environments

### Technical Details

- **Node.js**: >= 18.0.0
- **Package Manager**: npm
- **Module System**: ESM (ES Modules)
- **TypeScript**: Strict mode enabled
- **Target**: ES2020
- **Bundle**: tsup with tree-shaking
- **Dependencies**:
  - `ink` ^4.4.1 - Terminal UI framework
  - `react` ^18.3.1 - UI component library
  - `fuzzysort` ^2.0.4 - Fuzzy search
  - `jiti` ^1.21.7 - Runtime TypeScript loader
  - `zod` ^3.25.76 - Schema validation
  - `c12` ^1.11.2 - Configuration loading
  - `hookable` ^5.5.3 - Hook system

### Known Limitations

- Action hot-reload requires app restart (plugin hot-reload supported)
- Minimum terminal size: 50 columns × 20 rows
- Plugin config changes require enabling state toggle for reload

### Migration from Pre-Release

This is the first public release. If you were using development versions:

1. **Config Location**: Ensure configs are in `.arere/settings.json` (workspace) or `~/.arere/settings.json` (user)
2. **Plugin Format**: Update plugin configs to new JSON format (see README)
3. **Action Directories**: Actions should be in `.arere/` (not `.arere/actions/`)

See [Migration Guide](https://github.com/SphereStacking/Arere/blob/main/docs/migration/v0-to-v1.md) for details.

---

[0.1.0]: https://github.com/SphereStacking/Arere/releases/tag/v0.1.0
