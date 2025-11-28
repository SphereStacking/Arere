/**
 * 単一のキーバインド定義
 */
export interface KeyBinding {
  /** キー名: 'a'-'z', '0'-'9', 'enter', 'escape', 'space', 'tab',
   *  'upArrow', 'downArrow', 'leftArrow', 'rightArrow',
   *  'backspace', 'delete', '/', '?', etc. */
  key: string
  /** Ctrlキー */
  ctrl?: boolean
  /** Metaキー (Cmd on Mac) */
  meta?: boolean
  /** Shiftキー */
  shift?: boolean
}

/**
 * グローバル操作のキーバインド
 */
export interface GlobalKeyBindings {
  exit: KeyBinding[]
  search: KeyBinding[]
  help: KeyBinding[]
  settings: KeyBinding[]
  back: KeyBinding[]
  confirm: KeyBinding[]
}

/**
 * リスト操作のキーバインド
 */
export interface ListKeyBindings {
  up: KeyBinding[]
  down: KeyBinding[]
  select: KeyBinding[]
  toggle: KeyBinding[]
  bookmark: KeyBinding[]
}

/**
 * 入力操作のキーバインド
 */
export interface InputKeyBindings {
  submit: KeyBinding[]
  cancel: KeyBinding[]
  prev: KeyBinding[]
  next: KeyBinding[]
  toggle: KeyBinding[]
  delete: KeyBinding[]
}

/**
 * 確認入力のキーバインド
 */
export interface ConfirmKeyBindings {
  yes: KeyBinding[]
  no: KeyBinding[]
}

/**
 * フォーム操作のキーバインド
 */
export interface FormKeyBindings {
  nextField: KeyBinding[]
  prevField: KeyBinding[]
  submit: KeyBinding[]
  nextStep: KeyBinding[]
  prevStep: KeyBinding[]
}

/**
 * 設定画面のキーバインド
 */
export interface SettingsKeyBindings {
  reset: KeyBinding[]
}

/**
 * キーバインド設定全体
 */
export interface KeyBindingsConfig {
  global: GlobalKeyBindings
  list: ListKeyBindings
  input: InputKeyBindings
  confirm: ConfirmKeyBindings
  form: FormKeyBindings
  settings: SettingsKeyBindings
}

/**
 * 部分的なキーバインド設定（ユーザー設定用）
 */
export type PartialKeyBindingsConfig = {
  [K in keyof KeyBindingsConfig]?: {
    [P in keyof KeyBindingsConfig[K]]?: KeyBinding[]
  }
}
