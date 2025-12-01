import type { KeyBinding, KeyBindingsConfig } from '@/ui/keybindings'

/**
 * Inkのキー情報の型
 */
export interface InkKey {
  upArrow?: boolean
  downArrow?: boolean
  leftArrow?: boolean
  rightArrow?: boolean
  pageDown?: boolean
  pageUp?: boolean
  return?: boolean
  escape?: boolean
  ctrl?: boolean
  shift?: boolean
  tab?: boolean
  backspace?: boolean
  delete?: boolean
  meta?: boolean
}

/**
 * Ctrl+キーの組み合わせで送信される特殊文字コードのマッピング
 * ターミナルはCtrl+文字を制御文字として送信することがある
 * 注意: 多くのターミナルではkey.ctrlがfalseでも制御文字として送信される
 */
const CTRL_KEY_CHAR_CODES: Record<string, number> = {
  '/': 31, // Ctrl+/ → ASCII 31 (Unit Separator)
  '@': 0, // Ctrl+@ → ASCII 0 (Null)
  '[': 27, // Ctrl+[ → ASCII 27 (Escape)
  '\\': 28, // Ctrl+\ → ASCII 28 (File Separator)
  ']': 29, // Ctrl+] → ASCII 29 (Group Separator)
  '^': 30, // Ctrl+^ → ASCII 30 (Record Separator)
  _: 31, // Ctrl+_ → ASCII 31 (Unit Separator)
}

/**
 * 制御文字コードからキーへの逆マッピング
 * input が制御文字の場合、どのCtrl+キーとして認識すべきか
 */
const CHAR_CODE_TO_CTRL_KEY: Record<number, string> = {
  31: '/', // ASCII 31 → Ctrl+/
  0: '@', // ASCII 0 → Ctrl+@
  27: '[', // ASCII 27 → Ctrl+[ (Escape)
  28: '\\', // ASCII 28 → Ctrl+\
  29: ']', // ASCII 29 → Ctrl+]
  30: '^', // ASCII 30 → Ctrl+^
}

/**
 * 単一のキーバインドがマッチするか判定
 */
export function matchKey(input: string, key: InkKey, binding: KeyBinding): boolean {
  // 制御文字が入力された場合、対応するCtrl+キーとして扱う
  // 多くのターミナルではCtrl+/などを押すとkey.ctrl=falseで制御文字が送られる
  const inputCharCode = input.length === 1 ? input.charCodeAt(0) : -1
  const ctrlKeyFromCharCode = CHAR_CODE_TO_CTRL_KEY[inputCharCode]

  if (ctrlKeyFromCharCode && binding.ctrl && binding.key === ctrlKeyFromCharCode) {
    // 制御文字が来て、バインディングがCtrl+対応キーの場合はマッチ
    // key.ctrlフラグは無視（ターミナルによってはfalseのため）
    return true
  }

  // 修飾キーのチェック
  if (binding.ctrl && !key.ctrl) return false
  if (binding.meta && !key.meta) return false
  if (binding.shift && !key.shift) return false

  // 修飾キーが指定されていない場合、修飾キーが押されていたらマッチしない
  // ただしShiftは文字キーの場合は例外（大文字入力時など）
  if (!binding.ctrl && key.ctrl) return false
  // escapeキーの場合はmetaフラグを無視（一部のターミナルでEscがmeta+escapeとして送られるため）
  if (!binding.meta && key.meta && binding.key !== 'escape') return false
  // Shift+Tab と Tab を区別するため、特殊キーの場合はshiftもチェック
  if (!binding.shift && key.shift && binding.key === 'tab') return false

  // キー名のチェック
  switch (binding.key) {
    case 'return':
      return key.return === true
    case 'escape':
      return key.escape === true
    case ' ':
      return input === ' '
    case 'tab':
      return key.tab === true
    case 'upArrow':
      return key.upArrow === true
    case 'downArrow':
      return key.downArrow === true
    case 'leftArrow':
      return key.leftArrow === true
    case 'rightArrow':
      return key.rightArrow === true
    case 'backspace':
      return key.backspace === true
    case 'delete':
      return key.delete === true
    case 'pageUp':
      return key.pageUp === true
    case 'pageDown':
      return key.pageDown === true
    default:
      // 通常の文字キー
      return input === binding.key
  }
}

/**
 * 複数のキーバインドのいずれかにマッチするか判定
 */
export function matchAny(input: string, key: InkKey, bindings: KeyBinding[]): boolean {
  return bindings.some((b) => matchKey(input, key, b))
}

/**
 * キーマッチャーを作成
 *
 * @example
 * const kb = createKeyMatcher(keyBindings)
 *
 * useInput((input, key) => {
 *   if (kb.list.up(input, key)) { ... }
 *   if (kb.global.exit(input, key)) { ... }
 * })
 */
export function createKeyMatcher(config: KeyBindingsConfig) {
  const createMatcher = (bindings: KeyBinding[]) => {
    return (input: string, key: InkKey) => matchAny(input, key, bindings)
  }

  return {
    global: {
      exit: createMatcher(config.global.exit),
      search: createMatcher(config.global.search),
      help: createMatcher(config.global.help),
      settings: createMatcher(config.global.settings),
      back: createMatcher(config.global.back),
      confirm: createMatcher(config.global.confirm),
    },
    list: {
      up: createMatcher(config.list.up),
      down: createMatcher(config.list.down),
      select: createMatcher(config.list.select),
      toggle: createMatcher(config.list.toggle),
      bookmark: createMatcher(config.list.bookmark),
    },
    input: {
      submit: createMatcher(config.input.submit),
      cancel: createMatcher(config.input.cancel),
      prev: createMatcher(config.input.prev),
      next: createMatcher(config.input.next),
      toggle: createMatcher(config.input.toggle),
      delete: createMatcher(config.input.delete),
    },
    confirm: {
      yes: createMatcher(config.confirm.yes),
      no: createMatcher(config.confirm.no),
    },
    form: {
      nextField: createMatcher(config.form.nextField),
      prevField: createMatcher(config.form.prevField),
      submit: createMatcher(config.form.submit),
      nextStep: createMatcher(config.form.nextStep),
      prevStep: createMatcher(config.form.prevStep),
    },
    settings: {
      reset: createMatcher(config.settings.reset),
    },
  }
}

/**
 * キーマッチャーの型
 */
export type KeyMatcher = ReturnType<typeof createKeyMatcher>
