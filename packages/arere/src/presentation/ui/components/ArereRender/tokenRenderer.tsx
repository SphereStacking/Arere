/**
 * ArereRender トークンレンダラー
 *
 * LayoutToken を React 要素に変換（レンダリングのみ担当）
 * トランケーション・パディングはDomain層（layoutEngine）で処理済み
 */

import { hasModifier } from '@/domain/arereRender'
import type { LayoutToken } from '@/domain/arereRender/types'
import { Text } from 'ink'
import React from 'react'

export interface TokenRendererProps {
  /** レイアウト済みトークン */
  token: LayoutToken
  /** 選択状態 */
  isSelected: boolean
  /** プライマリカラー */
  primaryColor: string
}

/**
 * 単一トークンをレンダリング
 */
export const TokenRenderer: React.FC<TokenRendererProps> = ({
  token,
  isSelected,
  primaryColor,
}) => {
  // 色の決定
  const hasPrimary = hasModifier(token, 'primary')
  const color = hasPrimary || isSelected ? primaryColor : undefined

  // dim の決定（選択時は無効）
  const hasDim = hasModifier(token, 'dim')
  const dimColor = hasDim && !isSelected

  return (
    <Text color={color} dimColor={dimColor} wrap="truncate">
      {token.displayText}
    </Text>
  )
}

export interface TokenListRendererProps {
  /** レイアウト済みトークンリスト */
  tokens: LayoutToken[]
  /** 選択状態 */
  isSelected: boolean
  /** プライマリカラー */
  primaryColor: string
}

/**
 * トークンリストをレンダリング
 */
export const TokenListRenderer: React.FC<TokenListRendererProps> = ({
  tokens,
  isSelected,
  primaryColor,
}) => {
  return (
    <>
      {tokens.map((token, index) => (
        <TokenRenderer
          key={`${token.value}-${index}`}
          token={token}
          isSelected={isSelected}
          primaryColor={primaryColor}
        />
      ))}
    </>
  )
}
