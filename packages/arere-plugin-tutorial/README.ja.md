# arere-plugin-tutorial

> arere用チュートリアルプラグイン - 基本的な使い方、i18n、外部依存関係を学ぶ

日本語 | [English](./README.md)

## 機能

このプラグインはarereプラグインシステムの2つの主要機能を示します:

1. **i18n対応** - 翻訳ファイルを使用した多言語サポート
2. **外部依存関係** - プラグインアクションでのnpmパッケージ（date-fns）の使用

## テンプレートとして使用

このリポジトリは独自のarereプラグインを作成するためのテンプレートとして使用できます。

### オプション1: GitHubテンプレートを使用（推奨）

このリポジトリがGitHubでテンプレートリポジトリとして公開されている場合:

1. リポジトリページ上部の **「Use this template」** ボタンをクリック
2. **「Create a new repository」** を選択
3. プラグインの詳細を入力:
   - リポジトリ名: `arere-plugin-your-name`
   - 説明: プラグインの説明
   - 公開または非公開を選択
4. **「Create repository from template」** をクリック

新しいリポジトリはクリーンなコミット履歴とこのテンプレートの全ファイルを持ちます。

**📝 次のステップ:** テンプレートから作成後、詳細なカスタマイズガイドは [TEMPLATE.md](./TEMPLATE.md) を参照してください。

### オプション2: 手動クローン

```bash
# このリポジトリをクローン
git clone https://github.com/your-org/arere-plugin-tutorial.git arere-plugin-your-name
cd arere-plugin-your-name

# 元のgit履歴を削除
rm -rf .git
git init

# package.jsonを更新
# - "name" を "arere-plugin-your-name" に変更
# - "description", "author" などを更新

# src/index.tsを更新
# - プラグインのメタ情報を変更
# - i18nNamespaceを更新

# 依存関係をインストール
npm install

# 開発開始
npm run dev
```

### テンプレートリポジトリの設定（メンテナー向け）

GitHubで「Use this template」ボタンを有効にするには:

1. リポジトリの **Settings** に移動
2. **Template repository** セクションまでスクロール
3. ✅ **Template repository** チェックボックスをオン
4. 変更を保存

緑の **「Code」** ボタンが **「Use this template」** に変わります。

## インストール

```bash
npm install arere-plugin-tutorial
```

## 設定

`.arere/settings.json` に追加:

```json
{
  "plugins": {
    "arere-plugin-tutorial": true
  }
}
```

## アクション

### demo-plugin-i18n

プラグインでのi18n（国際化）対応を示します。

- プラグイン名前空間付きの翻訳キーを使用
- 英語・日本語の両方をサポート
- 翻訳用の `t()` 関数の使い方を表示
- i18n対応の対話式プロンプト

### demo-plugin-external-deps

外部依存関係（date-fns）の使用を示します。

- 様々なスタイルで日付をフォーマット
- プラグインアクションで外部npmパッケージを使用
- 対話式の日付フォーマットオプション
- 依存関係管理の実践的な例

## 開発

```bash
# 依存関係をインストール
npm install

# プラグインをビルド
npm run build

# ウォッチモード
npm run dev
```

## プロジェクト構造

```
arere-plugin-tutorial/
├── package.json
├── src/
│   └── index.ts                      # プラグイン定義
├── actions/
│   ├── demo-plugin-i18n.ts           # i18nデモ
│   └── demo-plugin-external-deps.ts  # 外部依存関係デモ
├── locales/
│   ├── en/
│   │   └── translation.json
│   └── ja/
│       └── translation.json
└── README.md
```

## ライセンス

MIT
