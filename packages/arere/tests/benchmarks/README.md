# Performance Benchmarks

このディレクトリには、`arere` プロジェクトの主要機能のパフォーマンスベンチマークが含まれています。

## ベンチマークの実行

```bash
# ベンチマークを実行（watch モード）
npm run bench

# ベンチマークを1回実行
npm run bench:run
```

## ベンチマークスイート

### 1. Fuzzy Search Performance (`fuzzy-search.bench.ts`)

ファジー検索のパフォーマンスを異なるデータセットサイズで測定します。

**テスト内容**:
- 10, 100, 1000, 5000 個のスクリプトでの検索
- 完全一致、部分一致、ファジー一致の比較
- データセット準備のオーバーヘッド測定

**主な結果**:
- 完全一致は部分/ファジー一致より 3-6倍高速
- 5000個のスクリプトでも実用的なパフォーマンス
- データセット準備は O(n) の計算量

### 2. Cache System Performance (`cache.bench.ts`)

キャッシュシステムの読み書き性能を測定します。

**テスト内容**:
- 単一キャッシュ操作（set, get, has, delete）
- 一括操作（10, 100, 1000 エントリ）
- 異なる値サイズでのパフォーマンス（100B, 1KB, 10KB, 100KB）
- キャッシュクリアの性能

**主な結果**:
- 全操作が高速で一貫したパフォーマンス
- 値サイズがパフォーマンスに与える影響は最小限
- 大量エントリの一括操作も効率的

### 3. Plugin Loading Performance (`plugin-loading.bench.ts`)

プラグインの検出と読み込みのパフォーマンスを測定します。

**テスト内容**:
- プラグイン検出（0, 1, 5, 10 個のプラグイン）
- プラグインパッケージの解決
- 複数プラグインの検出と解決

**主な結果**:
- プラグイン検出は高速
- パッケージ解決のオーバーヘッドは最小限
- 複数プラグインの並列処理が効率的

## パフォーマンス目標

| 操作 | 目標時間 | 現状 |
|------|---------|------|
| スクリプト検索 (1000個) | < 10ms | ✅ |
| キャッシュ読み書き | < 1ms | ✅ |
| プラグイン検出 (10個) | < 100ms | ✅ |

## ベンチマーク追加のガイドライン

新しいベンチマークを追加する際は：

1. `tests/benchmarks/` ディレクトリに `*.bench.ts` ファイルを作成
2. `bench()` 関数を使用してベンチマークを定義
3. 複数のデータセットサイズでテスト
4. 意味のある比較を含める
5. このREADMEを更新

```typescript
import { bench, describe } from 'vitest'

describe('My Feature Performance', () => {
  bench('operation name', () => {
    // ベンチマーク対象のコード
  })
})
```

## 継続的な監視

ベンチマークは以下の場合に実行してください：

- パフォーマンスクリティカルな変更を行った後
- リリース前の品質チェック
- パフォーマンス回帰を疑う場合
- 新機能の追加時

## 参考リンク

- [Vitest Benchmarking](https://vitest.dev/guide/features.html#benchmarking)
- [Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)
