/**
 * キーバインディングヒント表示ユーティリティ
 *
 * キーバインド設定から画面表示用のヒント文字列を生成する
 */

import type { KeyBinding } from '@/domain/keybindings'

/**
 * 特殊キーの表示名マッピング
 */
const KEY_DISPLAY_NAMES: Record<string, string> = {
  escape: 'Esc',
  return: 'Enter',
  upArrow: '↑',
  downArrow: '↓',
  leftArrow: '←',
  rightArrow: '→',
  ' ': 'Space',
  backspace: 'Backspace',
  delete: 'Delete',
  tab: 'Tab',
  pageUp: 'PageUp',
  pageDown: 'PageDown',
}

/**
 * KeyBindingをユーザー表示用の文字列に変換
 *
 * @example
 * formatKeyBinding({ key: 'c', ctrl: true }) // => "Ctrl+C"
 * formatKeyBinding({ key: 'escape' }) // => "Esc"
 * formatKeyBinding({ key: 'upArrow' }) // => "↑"
 */
export function formatKeyBinding(binding: KeyBinding): string {
  const parts: string[] = []

  // 修飾キーを追加
  if (binding.ctrl) parts.push('Ctrl')
  if (binding.meta) parts.push('Meta')
  if (binding.shift) parts.push('Shift')

  // キー名を取得
  const keyName = KEY_DISPLAY_NAMES[binding.key] ?? binding.key

  // 修飾キーがある場合は大文字に
  if (parts.length > 0 && keyName.length === 1) {
    parts.push(keyName.toUpperCase())
  } else {
    parts.push(keyName)
  }

  return parts.join('+')
}

/**
 * 複数のキーバインドを表示用に結合
 *
 * @param bindings キーバインド配列
 * @param maxDisplay 表示する最大数（デフォルト: 1）
 *
 * @example
 * formatKeyBindings([{ key: 'c', ctrl: true }, { key: 'q' }]) // => "Ctrl+C"
 * formatKeyBindings([{ key: 'c', ctrl: true }, { key: 'q' }], 2) // => "Ctrl+C/q"
 */
export function formatKeyBindings(bindings: KeyBinding[], maxDisplay = 1): string {
  if (bindings.length === 0) return ''

  const displayBindings = bindings.slice(0, maxDisplay)
  return displayBindings.map(formatKeyBinding).join('/')
}

/**
 * ヒント項目の型
 */
export interface HintItem {
  bindings: KeyBinding[]
  label: string
}

/**
 * 単一のヒント項目を生成
 *
 * @example
 * formatHintItem({ bindings: [{ key: 'q' }], label: '終了' }) // => "[q] 終了"
 */
export function formatHintItem(item: HintItem): string {
  const key = formatKeyBindings(item.bindings)
  if (!key) return ''
  return `[${key}] ${item.label}`
}

/**
 * 複数のヒント項目を結合
 *
 * @param items ヒント項目配列
 * @param separator 区切り文字（デフォルト: "  "）
 *
 * @example
 * formatHints([
 *   { bindings: [{ key: 'q' }], label: '終了' },
 *   { bindings: [{ key: '/' }], label: '検索' },
 * ]) // => "[q] 終了  [/] 検索"
 */
export function formatHints(items: HintItem[], separator = '  '): string {
  return items
    .map(formatHintItem)
    .filter((hint) => hint !== '')
    .join(separator)
}
