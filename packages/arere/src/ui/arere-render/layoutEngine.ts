/**
 * ArereRender レイアウトエンジン
 *
 * トークンを受け取り、幅計算・配置を行う
 */

import stringWidth from 'string-width'
import { hasModifier, shouldAlignWidth } from './parser'
import type { LayoutResult, LayoutToken, RenderData, TextAlign, Token } from './types'

/**
 * トークンのテキストを取得
 */
function getTokenText(token: Token, data: RenderData): string {
  if (token.type === 'literal') {
    return token.value
  }
  return data[token.value] ?? ''
}

/**
 * トークンの幅を計算
 */
function calculateTokenWidth(
  token: Token,
  text: string,
  maxWidths: Record<string, number>,
): number {
  const textWidth = stringWidth(text)

  if (token.type === 'literal') {
    return textWidth
  }

  // fixedWidth が最優先（:width(N) 修飾子）
  if (token.fixedWidth !== undefined) {
    return token.fixedWidth
  }

  // 幅揃え対象（:max または :right）の場合は maxWidths から取得
  if (shouldAlignWidth(token) && maxWidths[token.value] !== undefined) {
    return maxWidths[token.value]
  }

  return textWidth
}

/**
 * トークンがトランケーション対象かどうか
 */
function shouldTruncate(token: Token): boolean {
  return (
    hasModifier(token, 'shrink') || hasModifier(token, 'grow') || token.fixedWidth !== undefined
  )
}

/**
 * トークンの揃え方を取得
 */
function getTokenAlign(token: Token): TextAlign {
  if (hasModifier(token, 'right')) return 'right'
  if (hasModifier(token, 'center')) return 'center'
  return 'left'
}

/**
 * 表示用テキストを計算（トランケーション + パディング）
 */
function calculateDisplayText(
  text: string,
  width: number,
  truncate: boolean,
  align: TextAlign,
): string {
  let displayText = text

  // トランケーション（必要な場合のみ）
  if (truncate && width > 0 && stringWidth(text) > width) {
    displayText = truncateText(displayText, width)
  }

  // パディング（計算された幅に合わせる、揃え方を適用）
  return padText(displayText, width, align)
}

/**
 * Token を LayoutToken に変換
 */
function toLayoutToken(
  token: Token,
  data: RenderData,
  maxWidths: Record<string, number>,
): LayoutToken {
  const text = getTokenText(token, data)
  const isGrow = hasModifier(token, 'grow')
  const align = getTokenAlign(token)

  // grow トークンの幅は後で計算するので、一旦テキスト幅を設定
  const width = isGrow ? stringWidth(text) : calculateTokenWidth(token, text, maxWidths)

  // displayText は幅が確定してから計算（growの場合は後で更新）
  const displayText = calculateDisplayText(text, width, shouldTruncate(token), align)

  return {
    ...token,
    text,
    width,
    displayText,
    align,
  }
}

/**
 * レイアウト計算
 *
 * @param tokens - パース済みトークン配列
 * @param data - 変数データ
 * @param totalWidth - 総幅（ターミナル幅）
 * @param maxWidths - max修飾子用の最大幅マップ
 * @returns レイアウト結果
 */
export function calculateLayout(
  tokens: Token[],
  data: RenderData,
  totalWidth: number,
  maxWidths: Record<string, number> = {},
): LayoutResult {
  // トークンを LayoutToken に変換
  const layoutTokens = tokens.map((token) => toLayoutToken(token, data, maxWidths))

  // 固定幅の合計を計算（growトークン以外）
  const fixedWidth = layoutTokens
    .filter((t) => !hasModifier(t, 'grow'))
    .reduce((sum, t) => sum + t.width, 0)

  // grow トークンの数
  const growTokens = layoutTokens.filter((t) => hasModifier(t, 'grow'))
  const growCount = growTokens.length

  // grow 用の残り幅を計算
  const remainingWidth = totalWidth - fixedWidth
  const growWidth = growCount > 0 ? Math.max(0, Math.floor(remainingWidth / growCount)) : 0

  // grow トークンの幅と displayText を更新
  for (const token of layoutTokens) {
    if (hasModifier(token, 'grow')) {
      token.width = growWidth
      token.displayText = calculateDisplayText(token.text, growWidth, true, token.align)
    }
  }

  return {
    tokens: layoutTokens,
    growWidth,
  }
}

/**
 * 複数のデータセットから変数の最大幅を計算
 *
 * @param tokens - パース済みトークン配列
 * @param dataList - データの配列
 * @returns 変数名 → 最大幅 のマップ
 */
export function calculateMaxWidths(
  tokens: Token[],
  dataList: RenderData[],
): Record<string, number> {
  const maxWidths: Record<string, number> = {}

  // 幅揃え対象の変数を抽出
  const maxVariables = tokens
    .filter((t) => t.type === 'variable' && shouldAlignWidth(t))
    .map((t) => t.value)

  // 各変数の最大幅を計算
  for (const varName of maxVariables) {
    let maxWidth = 0
    for (const data of dataList) {
      const value = data[varName] ?? ''
      const width = stringWidth(value)
      if (width > maxWidth) {
        maxWidth = width
      }
    }
    maxWidths[varName] = maxWidth
  }

  return maxWidths
}

/**
 * テキストをパディング
 */
export function padText(text: string, width: number, align: TextAlign = 'left'): string {
  const textWidth = stringWidth(text)
  if (textWidth >= width) {
    return text
  }

  const totalPadding = width - textWidth

  if (align === 'right') {
    return ' '.repeat(totalPadding) + text
  }

  if (align === 'center') {
    const leftPadding = Math.floor(totalPadding / 2)
    const rightPadding = totalPadding - leftPadding
    return ' '.repeat(leftPadding) + text + ' '.repeat(rightPadding)
  }

  // left (default)
  return text + ' '.repeat(totalPadding)
}

/**
 * テキストを省略（shrink）
 */
export function truncateText(text: string, maxWidth: number): string {
  if (maxWidth <= 0) return ''

  const textWidth = stringWidth(text)
  if (textWidth <= maxWidth) {
    return text
  }

  if (maxWidth <= 1) {
    return '…'
  }

  // 文字を1つずつ追加して幅をチェック
  let result = ''
  let currentWidth = 0
  for (const char of text) {
    const charWidth = stringWidth(char)
    if (currentWidth + charWidth + 1 > maxWidth) {
      // 省略記号分の幅を確保
      break
    }
    result += char
    currentWidth += charWidth
  }

  return `${result}…`
}
