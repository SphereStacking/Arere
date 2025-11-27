# テスト実行ガイド

このプロジェクトは**テスト駆動開発（TDD）** を採用しています。

## 基本コマンド

### 全テスト実行
```bash
npm test
```

### ウォッチモード
```bash
npm run test:watch
```

### カバレッジ付き実行
```bash
npm run test:coverage
```

### 特定ファイルのみ実行
```bash
npm test -- --run path/to/test.test.ts
```

### ベンチマーク実行
```bash
npm run bench              # Watch mode
npm run bench:run          # Run once
```

## TDDサイクル

```
1. 🔴 Red: テストを書く（失敗するテスト）
   ↓
2. 🟢 Green: 最小限のコードを書いてテストを通す
   ↓
3. 🔵 Refactor: コードを改善する（テストは通ったまま）
   ↓
（繰り返し）
```

## カバレッジ目標

層別カバレッジ目標:
- Core層: 90%+
- Domain層: 95%+
- Infrastructure層: 85%+
- Application層: 95%+
- Presentation層: 80%+
- Shared層: 100%

**現在のカバレッジ**: 83.52% (776 tests)

## 詳細ドキュメント

テストパターン、モック戦略については以下を参照：
- **[テストガイド](../../docs/content/ja/3.development/2.testing-guide.md)**
  - 各層のテストパターン
  - モックのベストプラクティス
  - テストの命名規則
  - アンチパターン

## よくある問題

### テストが失敗する
1. `npm run typecheck` で型エラーを確認
2. `npm run build` でビルドエラーを確認
3. `vi.clearAllMocks()` を `beforeEach` に追加

### カバレッジが低い
- Domain層: 純粋関数なので高カバレッジを目指す
- Infrastructure層: モックを活用して実ファイルI/Oを避ける
- Presentation層: `ink-testing-library` でUIをテスト
