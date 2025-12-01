/**
 * キーバインディングヒント生成フック
 *
 * 現在のキーバインド設定から各画面用のヒント文字列を生成する
 */

import { t } from '@/i18n/index'
import { defaultKeyBindings } from '@/ui/keybindings'
import { useMemo } from 'react'
import { type HintItem, formatHints } from '../utils/keybindingHints'
import { useKeyBindings } from './useKeyBindings'

/**
 * キーバインディングヒントを生成するフック
 *
 * @example
 * const hints = useKeyBindingHints()
 * const hint = hints.list() // "q: 終了 | /: 検索 | ?: ヘルプ | s: 設定"
 */
export function useKeyBindingHints() {
  const kb = useKeyBindings()

  return useMemo(() => {
    // KeyMatcherからKeyBinding[]を取得するため、defaultKeyBindingsを使用
    // Note: useKeyBindingsはマッチャー関数を返すので、元のバインディングにアクセスするには
    // デフォルト設定とマージされた設定を取得する必要がある
    // 現状はdefaultKeyBindingsを直接使用（カスタム設定対応は後で改善）
    const bindings = defaultKeyBindings

    return {
      /**
       * list画面用ヒント
       * "q: 終了 | /: 検索 | Tab: ブックマーク | ?: ヘルプ | s: 設定"
       */
      list: (): string => {
        const items: HintItem[] = [
          { bindings: bindings.global.exit, label: t('ui:keybinding.labels.quit') },
          { bindings: bindings.global.search, label: t('ui:keybinding.labels.search') },
          { bindings: bindings.list.bookmark, label: t('ui:keybinding.labels.bookmark') },
          { bindings: bindings.global.help, label: t('ui:keybinding.labels.help') },
          { bindings: bindings.global.settings, label: t('ui:keybinding.labels.settings') },
        ]
        return formatHints(items)
      },

      /**
       * list画面（アクションなし）用ヒント
       * "q: 終了 | s: 設定"
       */
      listNoActions: (): string => {
        const items: HintItem[] = [
          { bindings: bindings.global.exit, label: t('ui:keybinding.labels.quit') },
          { bindings: bindings.global.settings, label: t('ui:keybinding.labels.settings') },
        ]
        return formatHints(items)
      },

      /**
       * 結果画面用ヒント
       * "Enter/Esc: 戻る"
       */
      result: (): string => {
        const items: HintItem[] = [
          {
            bindings: [...bindings.global.confirm, ...bindings.global.back],
            label: t('ui:keybinding.labels.back'),
          },
        ]
        return formatHints(items)
      },

      /**
       * 戻るのみのヒント
       * "Esc: 戻る"
       */
      back: (): string => {
        const items: HintItem[] = [
          { bindings: bindings.global.back, label: t('ui:keybinding.labels.back') },
        ]
        return formatHints(items)
      },

      /**
       * 検索画面用ヒント
       * "Tab: フォーカス切替 | Esc: 戻る"
       */
      search: (): string => {
        const items: HintItem[] = [
          { bindings: bindings.global.back, label: t('ui:keybinding.labels.back') },
        ]
        return formatHints(items)
      },

      /**
       * 実行中画面用ヒント
       * 現在は操作なし（将来的に中断機能追加時に使用）
       */
      executing: (): string => {
        return ''
      },

      /**
       * 設定画面用ヒント
       */
      settings: (): string => {
        const items: HintItem[] = [
          { bindings: bindings.list.up, label: '' },
          { bindings: bindings.list.down, label: t('ui:keybinding.labels.navigate') },
          { bindings: bindings.list.select, label: t('ui:keybinding.labels.select') },
          { bindings: bindings.input.prev, label: '' },
          { bindings: bindings.input.next, label: t('ui:keybinding.labels.layer') },
          { bindings: bindings.list.toggle, label: t('ui:keybinding.labels.toggle') },
          { bindings: bindings.global.back, label: t('ui:keybinding.labels.back') },
        ]
        // カスタムフォーマット: ↑↓: 移動 | Enter: 選択 | ←→: レイヤー | Space: 切替 | Esc: 戻る
        return formatHints(items.filter((item) => item.label !== ''))
      },

      /**
       * プラグインリスト用ヒント
       */
      pluginList: (): string => {
        const items: HintItem[] = [
          {
            bindings: [...bindings.list.up, ...bindings.list.down],
            label: t('ui:keybinding.labels.navigate'),
          },
          { bindings: bindings.list.toggle, label: t('ui:keybinding.labels.toggle') },
          { bindings: bindings.list.select, label: t('ui:keybinding.labels.configure') },
          { bindings: bindings.global.back, label: t('ui:keybinding.labels.back') },
        ]
        return formatHints(items, ' • ')
      },

      /**
       * プラグイン詳細用ヒント
       */
      pluginDetail: (): string => {
        const items: HintItem[] = [
          {
            bindings: [...bindings.list.up, ...bindings.list.down],
            label: t('ui:keybinding.labels.navigate'),
          },
          { bindings: bindings.list.select, label: t('ui:keybinding.labels.edit') },
          { bindings: bindings.global.back, label: t('ui:keybinding.labels.back') },
        ]
        return formatHints(items, ' • ')
      },

      /**
       * プラグイン詳細（設定なし）用ヒント
       */
      pluginDetailNoConfig: (): string => {
        const items: HintItem[] = [
          { bindings: bindings.global.back, label: t('ui:keybinding.labels.back') },
        ]
        return formatHints(items)
      },

      /**
       * 編集中（テキスト）用ヒント
       */
      editingText: (): string => {
        const items: HintItem[] = [
          { bindings: bindings.input.submit, label: t('ui:keybinding.labels.confirm') },
          { bindings: bindings.input.cancel, label: t('ui:keybinding.labels.cancel') },
        ]
        return formatHints(items, ' • ')
      },

      /**
       * 編集中（選択）用ヒント
       */
      editingSelect: (): string => {
        const items: HintItem[] = [
          {
            bindings: [...bindings.list.up, ...bindings.list.down],
            label: t('ui:keybinding.labels.navigate'),
          },
          { bindings: bindings.input.submit, label: t('ui:keybinding.labels.confirm') },
          { bindings: bindings.input.cancel, label: t('ui:keybinding.labels.cancel') },
        ]
        return formatHints(items, ' • ')
      },

      /**
       * 確認入力用ヒント
       */
      confirm: (): string => {
        const items: HintItem[] = [
          {
            bindings: [...bindings.confirm.yes, ...bindings.confirm.no],
            label: t('ui:keybinding.labels.select'),
          },
          { bindings: bindings.input.submit, label: t('ui:keybinding.labels.confirm') },
          { bindings: bindings.input.cancel, label: t('ui:keybinding.labels.cancel') },
        ]
        return formatHints(items)
      },

      /**
       * テキスト入力用ヒント
       */
      textInput: (): string => {
        const items: HintItem[] = [
          { bindings: bindings.input.submit, label: t('ui:keybinding.labels.submit') },
          { bindings: bindings.input.cancel, label: t('ui:keybinding.labels.cancel') },
        ]
        return formatHints(items)
      },

      /**
       * 数値入力用ヒント（範囲情報付き）
       */
      numberInput: (min?: number, max?: number): string => {
        const items: HintItem[] = [
          { bindings: bindings.input.submit, label: t('ui:keybinding.labels.submit') },
          { bindings: bindings.input.cancel, label: t('ui:keybinding.labels.cancel') },
        ]
        let hint = formatHints(items)
        if (min !== undefined && max !== undefined) {
          hint += ` ${t('ui:keybinding.labels.range', { min, max })}`
        }
        return hint
      },

      /**
       * パスワード入力用ヒント（最小文字数情報付き）
       */
      passwordInput: (minLength?: number): string => {
        const items: HintItem[] = [
          { bindings: bindings.input.submit, label: t('ui:keybinding.labels.submit') },
          { bindings: bindings.input.cancel, label: t('ui:keybinding.labels.cancel') },
        ]
        let hint = formatHints(items)
        if (minLength !== undefined) {
          hint += ` ${t('ui:keybinding.labels.minLength', { minLength })}`
        }
        return hint
      },

      /**
       * 複数行入力用ヒント（行数情報付き）
       */
      multilineInput: (lines: number): string => {
        const items: HintItem[] = [
          { bindings: bindings.input.submit, label: t('ui:keybinding.labels.submit') },
          { bindings: bindings.input.cancel, label: t('ui:keybinding.labels.cancel') },
        ]
        const linesStr = t('ui:keybinding.labels.lines', { count: lines })
        return `${linesStr} | ${t('ui:keybinding.labels.newline')}: Enter | ${formatHints(items)}`
      },

      /**
       * マルチセレクト用ヒント
       */
      multiSelect: (): string => {
        const items: HintItem[] = [
          {
            bindings: [...bindings.list.up, ...bindings.list.down],
            label: t('ui:keybinding.labels.select'),
          },
          { bindings: bindings.input.toggle, label: t('ui:keybinding.labels.toggle') },
          { bindings: bindings.input.submit, label: t('ui:keybinding.labels.confirm') },
          { bindings: bindings.input.cancel, label: t('ui:keybinding.labels.cancel') },
        ]
        return formatHints(items)
      },

      /**
       * フォーム用ヒント
       * Tab/Shift+Tab でフィールド移動、↑↓/←→ で選択肢移動
       */
      form: (): string => {
        const items: HintItem[] = [
          {
            bindings: [...bindings.form.prevField, ...bindings.form.nextField],
            label: t('ui:keybinding.labels.navigate'),
          },
          {
            bindings: [...bindings.list.up, ...bindings.list.down],
            label: t('ui:keybinding.labels.change'),
          },
          { bindings: bindings.input.toggle, label: t('ui:keybinding.labels.toggle') },
          { bindings: bindings.input.submit, label: t('ui:keybinding.labels.submit') },
          { bindings: bindings.input.cancel, label: t('ui:keybinding.labels.cancel') },
        ]
        return formatHints(items)
      },

      /**
       * ステップフォーム用ヒント
       * Tab/Shift+Tab でフィールド移動、↑↓/←→ で選択肢移動
       */
      stepForm: (isFirstStep: boolean, isLastStep: boolean): string => {
        const items: HintItem[] = [
          {
            bindings: [...bindings.form.prevField, ...bindings.form.nextField],
            label: t('ui:keybinding.labels.navigate'),
          },
          {
            bindings: [...bindings.list.up, ...bindings.list.down],
            label: t('ui:keybinding.labels.change'),
          },
          { bindings: bindings.input.toggle, label: t('ui:keybinding.labels.toggle') },
        ]
        if (!isFirstStep) {
          items.push({ bindings: bindings.form.prevStep, label: t('ui:keybinding.labels.back') })
        }
        items.push({
          bindings: bindings.input.submit,
          label: isLastStep ? t('ui:keybinding.labels.submit') : t('ui:keybinding.labels.next'),
        })
        items.push({ bindings: bindings.input.cancel, label: t('ui:keybinding.labels.cancel') })
        return formatHints(items)
      },

      /**
       * デフォルトヒント
       */
      default: (): string => {
        const items: HintItem[] = [
          {
            bindings: [...bindings.list.up, ...bindings.list.down],
            label: t('ui:keybinding.labels.select'),
          },
          { bindings: bindings.list.select, label: t('ui:keybinding.labels.run') },
          { bindings: bindings.global.exit, label: t('ui:keybinding.labels.quit') },
        ]
        return formatHints(items)
      },
    }
  }, [kb])
}
