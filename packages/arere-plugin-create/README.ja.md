# arere-plugin-create

> スタブから対話的に新しいアクションやプラグインを作成

日本語 | [English](./README.md)

## 概要

このプラグインは、事前定義されたスタブからArereアクションやプラグインを対話的に作成するジェネレーターを提供します。もう手動でファイルを作成する必要はありません！

## 機能

### create-action
- **対話式プロンプト**: アクション作成のステップバイステップガイド
- **複数のスタブ**:
  - **Basic**: 最小限のアクション構造
  - **Advanced**: プロンプト、シェル実行、エラーハンドリング付き
  - **With i18n**: 国際化対応
- **スコープ選択**: ワークスペース固有またはグローバルアクションを選択
- **重複チェック**: アクションファイルが既に存在する場合は警告

### create-plugin
- **プラグインジェネレーター**: スタブから完全なプラグインプロジェクトを作成
- **3種類のスタブ**:
  - **Minimal**: i18nや設定なしの基本的なプラグイン構造
  - **Standard**: i18nと設定サポート付きの標準プラグイン
  - **Full**: 複数のアクション例とテスト付きの完全なプラグイン
- **Git連携**: git設定から作者情報を自動抽出
- **バリデーション**: プラグイン名とメールのバリデーション
- **ディレクトリ作成**: 出力ディレクトリの自動セットアップ

### 共通
- **i18n対応**: 英語・日本語翻訳
- **型安全**: TypeScriptによる完全な型チェック

## インストール

```bash
# ローカルワークスペースからインストール（開発用）
cd packages/arere-plugin-create
npm run build
npm link

# arereにリンク
cd ../arere
npm link arere-plugin-create
```

## 使い方

### アクションの作成

1. ターミナルで `arere` を実行
2. アクションリストから **「create-action」** を選択
3. 対話式プロンプトに従う:
   - アクション名（kebab-case）
   - 説明
   - カテゴリ
   - タグ（複数選択）
   - スタブタイプ
   - スコープ（ワークスペースまたはグローバル）
4. `arere` を再起動して新しいアクションを読み込む

### プラグインの作成

1. ターミナルで `arere` を実行
2. アクションリストから **「create-plugin」** を選択
3. 対話式プロンプトに従う:
   - プラグイン名（`arere-plugin-` で始まる必要あり）
   - 説明
   - 作者名（git設定から自動入力）
   - 作者メール（git設定から自動入力）
   - スタブタイプ（minimal/standard/full）
   - 出力ディレクトリ
4. 作成されたディレクトリに移動:
   ```bash
   cd your-plugin-name
   npm install
   npm run build
   ```

## アクションテンプレート

### Basic

クイックスタート用の最小限のアクション構造:

```typescript
import { defineAction } from 'arere'

export default defineAction({
  name: 'my-action',
  description: 'My action description',
  category: 'utility',
  tags: ['demo'],
  async run({ tui }) {
    // アクションロジックをここに
  },
})
```

### Advanced

以下の例を含む:
- Prompt API（text, confirm, select）
- シェル実行（`$`）
- エラーハンドリング（try-catch）
- 出力フォーマット（section, step, success, error）
- Control API（spinner）

### With i18n

**ユーザーアクション**（プラグインではない）の国際化を示す:
- `translations` プロパティを使用したインライン翻訳（en/ja）
- `t()` による翻訳キーの使用（アクション自身の翻訳にはプレフィックス不要）
- パラメータ補間

**プラグイン開発の注意**:
**プラグイン**アクション（ユーザーアクションではない）を作成する場合、`plugin:` プレフィックスを使用してプラグイン翻訳にアクセスします:
```typescript
// プラグインアクション内
t('plugin:greeting')  // ✓ プラグインの locales/ にアクセス
t('greeting')         // ✗ アクション自身の名前空間にアクセス（空）
```

プラグインi18nの詳細は[プラグイン開発ガイド](../../docs/content/ja/1.guides/04.plugins/02.creating.md)を参照してください。

## プラグインテンプレート

### Minimal

i18nや設定なしの基本的なプラグイン構造:
- `src/index.ts` - プラグイン定義
- `actions/hello.ts` - シンプルなhello worldアクション
- 基本的なpackage.jsonとTypeScript設定

**ユースケース**: クイックプロトタイピング、ローカライゼーション不要なシンプルなプラグイン

### Standard

i18nと設定サポート付きの標準プラグイン:
- Minimalテンプレートの全ファイル
- `locales/en/` と `locales/ja/` - 翻訳ファイル
- `configSchema` - Zodベースの設定バリデーション
- `plugin:` プレフィックス使用を示すアクション例

**ユースケース**: i18nとユーザー設定が必要なほとんどの本番プラグイン

### Full

複数のアクション例とテスト付きの完全なプラグイン:
- Standardテンプレートの全ファイル
- 3つのアクション例: basic, prompts, config
- `tests/` テスト用ディレクトリ
- `CHANGELOG.md` バージョニング用
- ドキュメント付き包括的なREADME

**ユースケース**: 複数の機能を持つ複雑なプラグイン、ベストプラクティスを求めるチーム

## ディレクトリ構造

```
packages/arere-plugin-create/
├── src/
│   ├── index.ts                      # プラグインエントリーポイント
│   ├── template-renderer.ts          # アクションテンプレートレンダリング
│   ├── plugin-template-renderer.ts   # プラグインテンプレートレンダリング
│   ├── file-writer.ts                # ファイル書き込みユーティリティ
│   └── git-utils.ts                  # Git設定抽出
├── actions/
│   ├── create-action.ts              # アクションジェネレーター
│   └── create-plugin.ts              # プラグインジェネレーター
├── stubs/
│   ├── action/                       # アクションスタブ
│   │   ├── basic.ts.template
│   │   ├── advanced.ts.template
│   │   └── with-i18n.ts.template
│   └── plugin/                       # プラグインスタブ
│       ├── minimal/
│       ├── standard/
│       └── full/
├── locales/
│   ├── en/translation.json
│   └── ja/translation.json
└── README.md
```

## 開発

```bash
# ビルド
npm run build

# ウォッチモード
npm run dev

# 型チェック
npm run typecheck

# テスト実行（実装されている場合）
npm test
```

## ライセンス

MIT
