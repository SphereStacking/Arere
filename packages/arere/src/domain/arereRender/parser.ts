/**
 * ArereRender フォーマット文字列パーサー
 *
 * フォーマット例: "${prefix}[${category:max}] ${name:max} ${description:grow}"
 * VSCode風の変数記法を採用
 */

import type { Modifier, Token } from './types'

/** 有効な修飾子一覧 */
const VALID_MODIFIERS: Modifier[] = [
  'max',
  'grow',
  'shrink',
  'left',
  'right',
  'center',
  'dim',
  'primary',
]

/**
 * 修飾子文字列を検証してModifier型に変換
 */
function parseModifier(mod: string): Modifier | null {
  if (VALID_MODIFIERS.includes(mod as Modifier)) {
    return mod as Modifier
  }
  return null
}

/** width(N) 形式の正規表現 */
const WIDTH_PATTERN = /^width\((\d+)\)$/

/**
 * width(N) 修飾子をパース
 * @returns 有効な正の整数なら数値、それ以外は null
 */
function parseWidthModifier(mod: string): number | null {
  const match = mod.match(WIDTH_PATTERN)
  if (match) {
    const value = Number.parseInt(match[1], 10)
    // 0以下は無効
    if (value > 0) {
      return value
    }
  }
  return null
}

/**
 * 変数トークン（{var:mod1:mod2}）をパース
 */
function parseVariable(content: string): {
  name: string
  modifiers: Modifier[]
  fixedWidth?: number
} {
  const parts = content.split(':')
  const name = parts[0]
  const modifiers: Modifier[] = []
  let fixedWidth: number | undefined

  for (let i = 1; i < parts.length; i++) {
    // width(N) 形式をチェック
    const width = parseWidthModifier(parts[i])
    if (width !== null) {
      fixedWidth = width
      continue
    }

    // 通常の修飾子をチェック
    const mod = parseModifier(parts[i])
    if (mod) {
      modifiers.push(mod)
    }
  }

  return { name, modifiers, fixedWidth }
}

/**
 * フォーマット文字列をトークン配列にパース
 *
 * @param format - フォーマット文字列 (例: "${prefix}[${category:max}] ${name}")
 * @returns トークン配列
 *
 * @example
 * parseFormat("${prefix} ${name:max}")
 * // => [
 * //   { type: 'variable', value: 'prefix', modifiers: [] },
 * //   { type: 'literal', value: ' ', modifiers: [] },
 * //   { type: 'variable', value: 'name', modifiers: ['max'] },
 * // ]
 */
export function parseFormat(format: string): Token[] {
  const tokens: Token[] = []
  let current = 0
  let literalStart = 0

  while (current < format.length) {
    // 変数の開始を検出 (${...} 形式)
    if (format[current] === '$' && format[current + 1] === '{') {
      // 手前のリテラルがあれば追加
      if (current > literalStart) {
        tokens.push({
          type: 'literal',
          value: format.slice(literalStart, current),
          modifiers: [],
        })
      }

      // 変数の終了位置を探す
      const end = format.indexOf('}', current)
      if (end === -1) {
        // 閉じ括弧がない場合はリテラルとして扱う
        tokens.push({
          type: 'literal',
          value: format.slice(current),
          modifiers: [],
        })
        break
      }

      // 変数をパース (${の後から}の前まで)
      const content = format.slice(current + 2, end)
      const { name, modifiers, fixedWidth } = parseVariable(content)
      const token: Token = {
        type: 'variable',
        value: name,
        modifiers,
      }
      if (fixedWidth !== undefined) {
        token.fixedWidth = fixedWidth
      }
      tokens.push(token)

      current = end + 1
      literalStart = current
    } else {
      current++
    }
  }

  // 残りのリテラルを追加
  if (literalStart < format.length && current >= format.length) {
    tokens.push({
      type: 'literal',
      value: format.slice(literalStart),
      modifiers: [],
    })
  }

  return tokens
}

/**
 * トークンが特定の修飾子を持つか確認
 */
export function hasModifier(token: Token, modifier: Modifier): boolean {
  return token.modifiers.includes(modifier)
}

/**
 * トークンが幅揃え対象か（:max を持つか）
 */
export function shouldAlignWidth(token: Token): boolean {
  return hasModifier(token, 'max')
}

/**
 * トークン配列から変数名の一覧を取得
 */
export function getVariableNames(tokens: Token[]): string[] {
  return tokens.filter((t) => t.type === 'variable').map((t) => t.value)
}
