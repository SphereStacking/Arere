/**
 * ArereRender - 汎用フォーマットレンダリングコンポーネント
 *
 * テンプレート文字列を解析し、柔軟なレイアウトで表示する
 *
 * @example
 * <ArereRender
 *   format="{prefix}[{category:max}] {name:max} {description:grow} {tags:right:dim}"
 *   data={{
 *     prefix: '❯ ',
 *     category: 'git',
 *     name: 'clone-repo',
 *     description: 'Clone a repository',
 *     tags: '#git #dev',
 *   }}
 *   isSelected={true}
 *   width={80}
 * />
 */

import { calculateLayout, parseFormat } from '@/domain/arereRender'
import type { ArereRenderProps } from '@/domain/arereRender/types'
import { Box } from 'ink'
import React, { useMemo } from 'react'
import { TokenListRenderer } from './tokenRenderer'

export interface ArereRenderComponentProps extends ArereRenderProps {
  /** プライマリカラー */
  primaryColor?: string
}

/**
 * ArereRender コンポーネント
 */
export const ArereRender: React.FC<ArereRenderComponentProps> = ({
  format,
  data,
  isSelected = false,
  width,
  maxWidths = {},
  primaryColor = 'green',
}) => {
  // フォーマット文字列をパース（メモ化）
  const tokens = useMemo(() => parseFormat(format), [format])

  // レイアウト計算（メモ化）
  const layout = useMemo(
    () => calculateLayout(tokens, data, width, maxWidths),
    [tokens, data, width, maxWidths],
  )

  return (
    <Box width={width} flexWrap="nowrap">
      <TokenListRenderer
        tokens={layout.tokens}
        isSelected={isSelected}
        primaryColor={primaryColor}
      />
    </Box>
  )
}
