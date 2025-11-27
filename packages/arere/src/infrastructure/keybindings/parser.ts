/**
 * キー表記パーサー
 *
 * VSCode互換の簡略表記を内部形式に変換する
 * 例: "ctrl+c" → { key: 'c', ctrl: true }
 */

import type { KeyBinding } from '@/domain/keybindings'

/**
 * キー名のエイリアス（ユーザー向け表記 → 内部表記）
 */
const KEY_ALIASES: Record<string, string> = {
  // 矢印キー
  up: 'upArrow',
  down: 'downArrow',
  left: 'leftArrow',
  right: 'rightArrow',
  // 特殊キー
  enter: 'return',
  esc: 'escape',
  space: ' ',
  del: 'delete',
  bs: 'backspace',
  // PageUp/Down
  pageup: 'pageUp',
  pagedown: 'pageDown',
}

/**
 * 内部キー名 → ユーザー向け表記（逆変換用）
 */
const REVERSE_KEY_ALIASES: Record<string, string> = {
  upArrow: 'up',
  downArrow: 'down',
  leftArrow: 'left',
  rightArrow: 'right',
  return: 'enter',
  escape: 'esc',
  ' ': 'space',
  delete: 'del',
  backspace: 'bs',
  pageUp: 'pageup',
  pageDown: 'pagedown',
}

/**
 * キー表記をパースして内部形式に変換
 *
 * @param keyString - キー表記文字列（例: "ctrl+c", "shift+tab", "up"）
 * @returns 内部形式のKeyBinding
 *
 * @example
 * ```typescript
 * parseKeyBinding("ctrl+c")
 * // { key: 'c', ctrl: true }
 *
 * parseKeyBinding("ctrl+shift+p")
 * // { key: 'p', ctrl: true, shift: true }
 *
 * parseKeyBinding("up")
 * // { key: 'upArrow' }
 * ```
 */
export function parseKeyBinding(keyString: string): KeyBinding {
  const parts = keyString.toLowerCase().split('+')
  const binding: KeyBinding = { key: '' }

  for (const part of parts) {
    switch (part) {
      case 'ctrl':
        binding.ctrl = true
        break
      case 'meta':
      case 'cmd':
      case 'command':
        binding.meta = true
        break
      case 'shift':
        binding.shift = true
        break
      default:
        // キー名（エイリアス変換）
        binding.key = KEY_ALIASES[part] ?? part
        break
    }
  }

  return binding
}

/**
 * 内部形式をキー表記文字列に変換
 *
 * @param binding - 内部形式のKeyBinding
 * @returns キー表記文字列
 *
 * @example
 * ```typescript
 * formatKeyBinding({ key: 'c', ctrl: true })
 * // "ctrl+c"
 *
 * formatKeyBinding({ key: 'upArrow' })
 * // "up"
 * ```
 */
export function formatKeyBindingString(binding: KeyBinding): string {
  const parts: string[] = []

  if (binding.ctrl) parts.push('ctrl')
  if (binding.meta) parts.push('meta')
  if (binding.shift) parts.push('shift')

  // キー名（逆エイリアス変換）
  const keyName = REVERSE_KEY_ALIASES[binding.key] ?? binding.key
  parts.push(keyName)

  return parts.join('+')
}

/**
 * ユーザー向け設定形式
 */
export interface UserKeyBinding {
  key: string
}

/**
 * ユーザー設定形式を内部形式に変換
 *
 * @param userBinding - ユーザー設定形式
 * @returns 内部形式のKeyBinding
 */
export function parseUserKeyBinding(userBinding: UserKeyBinding): KeyBinding {
  return parseKeyBinding(userBinding.key)
}

/**
 * ユーザー設定形式の配列を内部形式の配列に変換
 *
 * @param userBindings - ユーザー設定形式の配列
 * @returns 内部形式のKeyBinding配列
 */
export function parseUserKeyBindings(userBindings: UserKeyBinding[]): KeyBinding[] {
  return userBindings.map(parseUserKeyBinding)
}
