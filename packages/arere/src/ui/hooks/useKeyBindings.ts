/**
 * キーバインド取得・マッチング用フック
 */

import { type KeyMatcher, createKeyMatcher } from '@/ui/keybindings'
import { useContext, useMemo } from 'react'
import { AppContext } from '../AppContext'

/**
 * キーバインドを取得してマッチャーを返すフック
 *
 * キーバインディング設定はAppContextから取得される
 * (keybindings.jsonから読み込まれた設定)
 *
 * @example
 * const kb = useKeyBindings()
 *
 * useInput((input, key) => {
 *   if (kb.list.up(input, key)) {
 *     // 上キーが押された
 *   }
 *   if (kb.global.exit(input, key)) {
 *     // 終了キー（Ctrl+C or q）が押された
 *   }
 * })
 */
export function useKeyBindings(): KeyMatcher {
  const { keyBindings } = useContext(AppContext)

  const keyMatcher = useMemo(() => {
    return createKeyMatcher(keyBindings)
  }, [keyBindings])

  return keyMatcher
}
