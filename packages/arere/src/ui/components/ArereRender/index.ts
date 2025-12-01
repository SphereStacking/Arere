/**
 * ArereRender - 汎用フォーマットレンダリングコンポーネント
 */

export { ArereRender, type ArereRenderComponentProps } from './ArereRender'
export { TokenRenderer, TokenListRenderer } from './tokenRenderer'
// Re-export from domain layer for convenience
export { calculateLayout, calculateMaxWidths, padText, truncateText } from '@/ui/arere-render'
