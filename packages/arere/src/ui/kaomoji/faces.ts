/**
 * Kaomoji face definitions
 */

import type { Face } from './types'

export const faces: Face[] = [
  // フォールバック顔文字（dynamicKaomoji: false のとき使用）
  { face: '(¯n ¯?)', category: 'idle', fallback: true },

  // startup - 起動直後
  { face: '(¯n ¯?)', category: 'startup' },

  // idle - 入力待ち
  { face: '( ˙-˙ )', category: 'idle' },
  { face: '( ・_・)', category: 'idle' },

  // searching - 検索中
  { face: '( ˙-˙ )?', category: 'searching' },

  // loading - 処理中
  { face: '( ˙-˙ )...', category: 'loading' },

  // found - 見つけた
  { face: '( ・∀・)!', category: 'found' },
  { face: '(*・_・)ノ', category: 'found' },
  { face: "( 'ω')!", category: 'found' },

  // notFound - 見つからない
  { face: '(´・_・`)', category: 'notFound' },
  { face: '(._.)', category: 'notFound' },
  { face: '( ˙-˙ )orz', category: 'notFound' },

  // success - 実行成功
  { face: "( 'ω')b", category: 'success' },
  { face: '( ・∀・)b', category: 'success' },

  // error - エラー
  { face: '(；´д`)', category: 'error' },
  { face: '( ˙-˙ ;)', category: 'error' },
]
