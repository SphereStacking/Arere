/**
 * ArereRender - 汎用フォーマットレンダリングシステムの型定義
 */

/**
 * 修飾子の種類
 *
 * - 幅: max, width(N)
 * - 揃え: left, right, center
 * - 伸縮: grow, shrink
 * - 色: dim, primary
 */
export type Modifier = 'max' | 'grow' | 'shrink' | 'left' | 'right' | 'center' | 'dim' | 'primary'

/**
 * テキスト揃えの種類
 */
export type TextAlign = 'left' | 'right' | 'center'

/**
 * トークンの種類
 */
export type TokenType = 'variable' | 'literal'

/**
 * パース済みトークン
 */
export interface Token {
  /** トークンの種類 */
  type: TokenType
  /** 変数名（type === 'variable' の場合）またはリテラル文字列 */
  value: string
  /** 修飾子リスト（type === 'variable' の場合のみ） */
  modifiers: Modifier[]
  /** 固定幅指定（:width(N) 修飾子で指定） */
  fixedWidth?: number
}

/**
 * レンダリングに渡すデータ
 */
export type RenderData = Record<string, string | undefined>

/**
 * レイアウト計算後のトークン情報
 */
export interface LayoutToken extends Token {
  /** 計算された幅 */
  width: number
  /** 元のテキスト（変数から取得した値） */
  text: string
  /** 表示用テキスト（トランケーション・パディング済み） */
  displayText: string
  /** テキスト揃え */
  align: TextAlign
}

/**
 * レイアウト計算結果
 */
export interface LayoutResult {
  /** レイアウト済みトークン */
  tokens: LayoutToken[]
  /** grow トークンに割り当てる幅 */
  growWidth: number
}

/**
 * ArereRender コンポーネントの Props
 */
export interface ArereRenderProps {
  /** フォーマット文字列 */
  format: string
  /** 変数データ */
  data: RenderData
  /** 選択状態 */
  isSelected?: boolean
  /** 表示幅（ターミナル幅） */
  width: number
  /** max 修飾子用の最大幅マップ（外部で計算して渡す） */
  maxWidths?: Record<string, number>
}
