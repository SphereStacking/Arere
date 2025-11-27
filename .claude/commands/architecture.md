# アーキテクチャ参照

現在のArereプロジェクトは**Clean Architecture / レイヤードアーキテクチャ**に基づいて設計されています。

## レイヤー構造

```
src/
├── core/                # Core層 - Action loading system
├── domain/              # Domain層 - Business logic & types
├── infrastructure/      # Infrastructure層 - External systems
├── application/         # Application層 - Use cases
├── presentation/        # Presentation層 - UI
└── shared/              # Shared層 - Common utilities
```

**Path Alias**: `@/*` → `./src/*`

## 詳細ドキュメント

以下のドキュメントを参照してください：

- **[アーキテクチャガイド](../../docs/content/ja/3.development/1.architecture-guide.md)**
  - レイヤー構造の詳細
  - 各層の責務と実装例
  - データフロー
  - 依存関係のルール

- **[テストガイド](../../docs/content/ja/3.development/2.testing-guide.md)**
  - TDD原則
  - 各層のテストパターン
  - モックのベストプラクティス

- **[CLAUDE.md](../../packages/arere/CLAUDE.md)**
  - パッケージ固有の詳細
  - 開発コマンド
  - 重要な制約事項

## 更新方針

アーキテクチャに変更があった場合：
1. `docs/content/ja/3.development/1.architecture-guide.md` を更新
2. `packages/arere/CLAUDE.md` の概要を確認
3. ルートの `CLAUDE.md` の概要を確認
