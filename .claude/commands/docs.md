# ドキュメント更新ガイド

このコマンドは、プロジェクトのドキュメントを更新する際のガイドです。

## ドキュメント構成

### 開発ガイド（Development Guides）

場所: `docs/content/ja/3.development/`

- **[1.architecture-guide.md](../../docs/content/ja/3.development/1.architecture-guide.md)**
  - レイヤー構造
  - 各層の責務と実装例
  - データフロー
  - Path Alias

- **[2.testing-guide.md](../../docs/content/ja/3.development/2.testing-guide.md)**
  - TDD原則
  - 各層のテストパターン
  - モックのベストプラクティス
  - テスト実行コマンド

### CLAUDE.md

- **[ルートCLAUDE.md](../../CLAUDE.md)**
  - モノレポ全体の概要
  - 開発ポリシー（TDD、後方互換性なし）
  - 開発ワークフロー

- **[packages/arere/CLAUDE.md](../../packages/arere/CLAUDE.md)**
  - パッケージ固有の詳細
  - アーキテクチャ概要
  - 開発コマンド
  - 重要な制約事項

## 更新が必要なタイミング

### アーキテクチャ変更時

**更新すべきファイル**:
1. `docs/content/ja/3.development/1.architecture-guide.md` （詳細）
2. `packages/arere/CLAUDE.md` （概要確認）
3. ルート `CLAUDE.md` （概要確認）

**例**:
- 新しい層を追加
- 依存関係のルールを変更
- ディレクトリ構造を変更

### テスト方針変更時

**更新すべきファイル**:
1. `docs/content/ja/3.development/2.testing-guide.md` （詳細）
2. `packages/arere/CLAUDE.md` （概要確認）
3. ルート `CLAUDE.md` （概要確認）

**例**:
- 新しいテストパターンを発見
- モック戦略を変更
- カバレッジ目標を変更

### 新機能追加時

**更新すべきファイル**:
- `packages/arere/CLAUDE.md` - 機能概要
- 該当する development guide - 実装詳細

### 開発ポリシー変更時

**更新すべきファイル**:
- ルート `CLAUDE.md` - ポリシー変更
- `packages/arere/CLAUDE.md` - 影響範囲確認

## ドキュメントの原則

### Single Source of Truth
- **詳細は development guide に集約**
- CLAUDE.md は概要のみ
- 重複を避ける

### 更新方針の明記
- 各ドキュメントに「⚠️ 更新方針」を記載
- どのドキュメントを更新すべきか明確に

### リンク活用
- ドキュメント間の相互参照
- 重複記述を避ける

## ドキュメントサイト

### 開発サーバー起動
```bash
cd docs
npm run dev
```

### ビルド
```bash
cd docs
npm run build
```

### プレビュー
```bash
cd docs
npm run preview
```

ドキュメントサイトは Docus (Nuxt Content) を使用しています。

## 新しいガイドを追加する場合

1. `docs/content/ja/3.development/` にファイル作成
2. Frontmatter を追加:
   ```yaml
   ---
   title: ガイドタイトル
   description: 説明
   ---
   ```
3. 関連する CLAUDE.md にリンクを追加
