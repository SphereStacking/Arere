/**
 * Kaomoji type definitions
 */

/** 基本状態カテゴリ */
export type BaseCategory = 'startup' | 'idle' | 'searching' | 'loading'

/** 結果系カテゴリ */
export type ResultCategory = 'found' | 'notFound' | 'success' | 'error'

/** 顔文字カテゴリ（Phase 1 スコープ） */
export type FaceCategory = BaseCategory | ResultCategory

/** 顔文字定義 */
export type Face = {
  /** 顔文字 */
  face: string
  /** カテゴリ */
  category: FaceCategory
  /** 出現確率 (0-1, デフォルト1) */
  weight?: number
  /** フォールバック用（dynamicKaomoji: false のとき使用） */
  fallback?: boolean
}
