# arere

> **あれれ？何だっけ** - コマンドを覚えられない私のためのランチャー

日本語 | [English](./README.md)

[![CI](https://github.com/your-org/arere/workflows/CI/badge.svg)](https://github.com/your-org/arere/actions)
[![npm version](https://img.shields.io/npm/v/arere.svg)](https://www.npmjs.com/package/arere)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

TypeScriptベースの**常駐型ターミナルランチャー**。コマンドを覚える必要はありません。`arere` を起動すれば、よく使うアクションをファジー検索で実行できます。

## ✨ 特徴

- 🏃 **常駐型** - 一度起動すれば、連続してアクションを実行可能
- 🔍 **ファジー検索** - アクション名を曖昧に検索して実行
- 📝 **TypeScript製** - アクションをTypeScriptで記述可能
- 🎨 **インタラクティブUI** - プロンプト、選択、確認など豊富なUI
- 🔌 **プラグインシステム** - npm パッケージとしてアクションを共有
- 🌍 **グローバル/ローカル** - グローバルアクションとプロジェクト固有アクション
- 🌏 **多言語対応** - 英語・日本語に対応（i18n）
- 🔄 **ホットリロード** - アクションを編集すると自動で再読み込み
- 💻 **tmux/Zellij 統合** - ターミナルマルチプレクサと連携
- 🚀 **CI/CD統合** - GitHub Actionsで型安全なワークフロー

## 🎯 GitHub Actions統合

TypeScriptでCI/CDスクリプトを書こう！bashスクリプトよ、さようなら。

### Before (Bash)

```yaml
- run: |
    if [ "$BRANCH" != "main" ]; then
      echo "Error: Must be on main"
      exit 1
    fi
    npm run build
    npm run deploy
```

### After (TypeScript with Arere)

```typescript
// .arere/deploy.ts
export default {
  name: 'deploy',
  description: 'Deploy to production',
  async run({ $, tui }) {
    const { stdout } = await $`git branch --show-current`
    if (stdout.trim() !== 'main') {
      throw new Error('Must be on main branch')
    }

    await $`npm run build`
    await $`npm run deploy`

    tui.output.success('Deployed!')
  }
}
```

```yaml
# .github/workflows/deploy.yml
- uses: ./arere-action
  with:
    action: deploy
```

**メリット:**
- ✅ 型安全 - TypeScriptで実行前にエラー検出
- ✅ ローカルでテスト可能 - `arere run deploy` で即確認
- ✅ 読みやすい - bashの `set -e` や `$?` 不要
- ✅ 再利用可能 - 同じコードがローカル/CI両方で動作

詳細: [GitHub Actions Integration Guide](docs/guides/github-actions-integration.md)

## 📦 インストール

```bash
npm install -g arere
```

**必要要件**:
- Node.js >= 18.0.0

## 🚀 クイックスタート

### 1. 起動

```bash
arere
```

初回起動時、アクションディレクトリが作成されます：
- グローバル: `~/.arere/`
- プロジェクト固有: `./.arere/`

### 2. 最初のアクションを作成

```bash
# グローバルアクションを作成
mkdir -p ~/.arere
cat > ~/.arere/hello.ts << 'EOF'
export const meta = {
  name: 'hello',
  description: 'Hello World を表示',
}

export default async function() {
  console.log('Hello, World!')
}
EOF
```

### 3. アクションを実行

```bash
arere
```

アクション一覧が表示されます：

```
╭─ arere(・_・?) ─────────── q: 終了 | /: 検索 | ?: ヘルプ ─╮

❯ hello  Hello World を表示  (global)

╰─────────────────────────────────────────────────────────╯
```

**操作方法**:
- `↑↓`: アクションを選択
- `Enter`: アクションを実行
- `/`: ファジー検索モードに入る
- `q` / `Ctrl+C`: 終了

実行後、また選択画面に戻ります（常駐型）。

## 📖 使い方

### アクションの基本構造

アクションは `export default async function()` 形式で記述します：

```typescript
// ~/.arere/git-status.ts
export const meta = {
  name: 'git-status',
  description: 'Git のステータスを表示',
  category: 'git',
  tags: ['git', 'status'],
}

export default async function() {
  const { $ } = await import('execa')
  const { stdout } = await $`git status --short`
  console.log(stdout)
}
```

**メタデータフィールド**:
- `name`: アクションの一意な名前（必須）
- `description`: 説明文（必須）
- `category`: カテゴリ（任意）
- `tags`: タグの配列（任意、例: `['git', 'status']`）

### インタラクティブ入力

`prompt` APIを使ってユーザー入力を受け取れます：

```typescript
// ~/.arere/git-commit.ts
import { prompt } from 'arere'

export const meta = {
  name: 'git-commit',
  description: 'Git コミットを作成',
}

export default async function() {
  const message = await prompt.text({
    message: 'コミットメッセージを入力:',
    validate: (value) => value.length > 0 || 'メッセージを入力してください',
  })

  const { $ } = await import('execa')
  await $`git commit -m ${message}`

  console.log('✓ コミット完了')
}
```

### 選択リスト

```typescript
// ~/.arere/git-switch.ts
import { prompt } from 'arere'

export const meta = {
  name: 'git-switch',
  description: 'ブランチを切り替え',
}

export default async function() {
  const { $ } = await import('execa')
  const { stdout } = await $`git branch --format=%(refname:short)`
  const branches = stdout.split('\n').filter(Boolean)

  const branch = await prompt.select({
    message: 'ブランチを選択:',
    options: branches.map(b => ({ label: b, value: b })),
  })

  await $`git switch ${branch}`
  console.log(`✓ ${branch} に切り替えました`)
}
```

### 確認ダイアログ

```typescript
// ~/.arere/dangerous-operation.ts
import { prompt } from 'arere'

export const meta = {
  name: 'dangerous-operation',
  description: '危険な操作',
}

export default async function() {
  const confirmed = await prompt.confirm({
    message: '本当に実行しますか？',
    default: false,
  })

  if (!confirmed) {
    console.log('キャンセルしました')
    return
  }

  console.log('実行しました')
}
```

### 外部ライブラリの使用

アクションから外部ライブラリを動的にインポートできます：

```typescript
// ~/.arere/format-date.ts
export const meta = {
  name: 'format-date',
  description: '現在時刻をフォーマット',
}

export default async function() {
  // 動的インポート
  const { format } = await import('date-fns')
  const now = new Date()

  console.log('現在時刻:', format(now, 'yyyy-MM-dd HH:mm:ss'))
}
```

**注意**: 外部ライブラリはグローバルにインストールする必要があります：
```bash
npm install -g date-fns
```

## 🔌 プラグインシステム

プラグインを使うと、アクションをnpmパッケージとして配布・共有できます。

### プラグインのインストール

```bash
npm install -g arere-plugin-git
```

### 設定ファイルでプラグインを有効化

```json
// ~/.arere-config.json
{
  "plugins": [
    "arere-plugin-git",
    "arere-plugin-docker"
  ]
}
```

### プラグインの作成

プラグインは `arere-plugin-*` という命名規則のnpmパッケージです：

```
arere-plugin-example/
├── package.json
├── src/
│   └── index.ts
└── actions/
    ├── action-1.ts
    └── action-2.ts
```

```json
// package.json
{
  "name": "arere-plugin-example",
  "version": "1.0.0",
  "keywords": ["arere-plugin"],
  "main": "./dist/index.js",
  "files": ["dist", "actions"]
}
```

```typescript
// src/index.ts
import { definePlugin } from 'arere'

export default definePlugin({
  name: 'example',
  actions: [
    './actions/action-1.ts',
    './actions/action-2.ts',
  ],
})
```

詳細は [プラグイン開発ガイド](./docs/guides/developing-plugins.md) を参照してください。

## ⚙️ 設定

設定ファイル:
- **ワークスペース**: `.arere/settings.json` (プロジェクト固有の設定)
- **ユーザー**: `~/.arere/settings.json` (グローバル設定)

```json
{
  "locale": "en",
  "actionsDir": "./.arere",
  "logLevel": "info"
}
```

### 設定オプション

#### `locale`
- **型**: `"en" | "ja"`
- **デフォルト**: システムロケール、または `en`
- **説明**: UI言語の設定

サポート言語:
- `en`: English
- `ja`: 日本語 (Japanese)

```json
{
  "locale": "ja"
}
```

ロケール決定の優先順位:
1. 設定ファイルの `locale` フィールド
2. システムロケール (`LANG`, `LC_ALL` 環境変数)
3. デフォルト (English)

#### `actionsDir`
- **型**: `string`
- **デフォルト**: `./.arere`
- **説明**: プロジェクト固有のアクションディレクトリ

#### `logLevel`
- **型**: `"trace" | "debug" | "info" | "warn" | "error" | "fatal"`
- **デフォルト**: `info`
- **説明**: ログレベルの設定

## 📚 ドキュメント

- [アクション作成チュートリアル](./docs/ja/guides/creating-actions.md)
- [国際化(i18n)ガイド](./docs/i18n-guide.md)
- [プラグイン開発ガイド](./docs/guides/developing-plugins.md)
- [API リファレンス](./docs/api/)
  - [defineAction API](./docs/ja/api/defineAction.md)
  - [prompt API](./docs/api/prompt.md)
  - [$ (shell) API](./docs/api/shell.md)
  - [Plugin API](./docs/api/plugin.md)

## 🛠️ 開発

```bash
# リポジトリをクローン
git clone https://github.com/your-org/arere.git
cd arere

# 依存関係をインストール
npm install

# ビルド
npm run build

# テスト
npm test

# カバレッジ
npm run test:coverage

# ベンチマーク
npm run bench:run

# Lint & Format
npm run lint
npm run format
```

開発に貢献したい方は [CONTRIBUTING.md](./CONTRIBUTING.md) をご覧ください。

## 🔍 トラブルシューティング

### アクションが見つからない

```bash
# アクションディレクトリを確認
ls -la ~/.arere
ls -la ./.arere

# キャッシュをクリア
rm -rf ~/.cache/arere
```

### プラグインが読み込まれない

```bash
# プラグインがインストールされているか確認
npm list -g | grep arere-plugin

# 設定ファイルを確認
cat ~/.arere-config.json
```

### TypeScriptのエラー

アクションは実行時に `jiti` でトランスパイルされます。型エラーがあっても実行できますが、型チェックを行う場合：

```bash
npx tsc --noEmit your-action.ts
```

## 📝 ライセンス

MIT © [Your Name]

## 🙏 謝辞

このプロジェクトは以下のオープンソースプロジェクトに支えられています：

- [Ink](https://github.com/vadimdemedes/ink) - React for CLIs
- [fuzzysort](https://github.com/farzher/fuzzysort) - Fast fuzzy search
- [jiti](https://github.com/unjs/jiti) - Runtime TypeScript loader
- [execa](https://github.com/sindresorhus/execa) - Better child_process

---

**あれれ？何だっけ** - コマンドを忘れても大丈夫。`arere` がそばにいます。
