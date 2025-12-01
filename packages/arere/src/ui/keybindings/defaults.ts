import type { KeyBindingsConfig } from '@/ui/keybindings'

/**
 * デフォルトキーバインド設定
 */
export const defaultKeyBindings: KeyBindingsConfig = {
  global: {
    exit: [{ key: 'c', ctrl: true }, { key: 'q' }],
    search: [{ key: '/' }],
    help: [{ key: '?' }],
    settings: [{ key: 's' }],
    back: [{ key: 'escape' }],
    confirm: [{ key: 'return' }],
  },

  list: {
    up: [{ key: 'upArrow' }],
    down: [{ key: 'downArrow' }],
    select: [{ key: 'return' }],
    toggle: [{ key: ' ' }],
    bookmark: [{ key: 'tab' }],
  },

  input: {
    submit: [{ key: 'return' }],
    cancel: [{ key: 'escape' }],
    prev: [{ key: 'leftArrow' }],
    next: [{ key: 'rightArrow' }],
    toggle: [{ key: ' ' }],
    delete: [{ key: 'backspace' }, { key: 'delete' }],
  },

  confirm: {
    yes: [{ key: 'y' }, { key: 'Y' }],
    no: [{ key: 'n' }, { key: 'N' }],
  },

  form: {
    nextField: [{ key: 'tab' }],
    prevField: [{ key: 'tab', shift: true }],
    submit: [{ key: 'return', ctrl: true }],
    nextStep: [{ key: 'rightArrow', ctrl: true }],
    prevStep: [{ key: 'leftArrow', ctrl: true }],
  },

  settings: {
    reset: [{ key: 'delete' }],
  },
}
