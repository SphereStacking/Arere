/**
 * Tutorial 02: Output API
 *
 * Related docs: docs/content/ja/1.guides/3.creating-actions.md
 *
 * What you'll learn:
 * - Various tui.output methods
 * - Log levels (log, success, error, warn, info)
 * - Structured output (list, table, json, keyValue)
 * - Formatting (section, step, separator, code)
 */

import { defineAction } from 'arere'

const translations = {
  en: {
    description: 'Output API Basics',
    title: 'Output API Tutorial',
    section_log_levels: 'Log Levels',
    section_structured: 'Structured Output',
    section_formatting: 'Formatting',
    completed: 'All output methods demonstrated!',
    next_step: 'Next: Try "03-prompt-basics" to learn user input',
    log_general: 'log() - General message',
    log_success: 'success() - Success message',
    log_error: 'error() - Error message',
    log_warn: 'warn() - Warning message',
    log_info: 'info() - Info message',
    list_label: 'list() - Bullet list:',
    keyvalue_label: 'keyValue() - Key-value pairs:',
    table_label: 'table() - Table:',
    json_label: 'json() - JSON output:',
    section_label: 'section() - Section header',
    step_label: 'step() - Numbered step',
    separator_label: 'separator() - Divider line:',
    code_label: 'code() - Code block:',
    table_method: 'Method',
    table_purpose: 'Purpose',
    table_general_output: 'General output',
    table_success_messages: 'Success messages',
    table_error_messages: 'Error messages',
    // Sample data
    list_item1: 'Apple',
    list_item2: 'Banana',
    list_item3: 'Cherry',
    kv_name: 'Name',
    kv_version: 'Version',
    kv_platform: 'Platform',
  },
  ja: {
    description: 'Output API の基礎',
    title: 'Output API チュートリアル',
    section_log_levels: 'ログレベル',
    section_structured: '構造化出力',
    section_formatting: 'フォーマット',
    completed: '全ての出力メソッドをデモしました！',
    next_step: '次へ: "03-prompt-basics" でユーザー入力を学びましょう',
    log_general: 'log() - 通常のメッセージ',
    log_success: 'success() - 成功メッセージ',
    log_error: 'error() - エラーメッセージ',
    log_warn: 'warn() - 警告メッセージ',
    log_info: 'info() - 情報メッセージ',
    list_label: 'list() - 箇条書きリスト:',
    keyvalue_label: 'keyValue() - キーと値のペア:',
    table_label: 'table() - テーブル:',
    json_label: 'json() - JSON 出力:',
    section_label: 'section() - セクションヘッダー',
    step_label: 'step() - 番号付きステップ',
    separator_label: 'separator() - 区切り線:',
    code_label: 'code() - コードブロック:',
    table_method: 'メソッド',
    table_purpose: '用途',
    table_general_output: '一般的な出力',
    table_success_messages: '成功メッセージ',
    table_error_messages: 'エラーメッセージ',
    // Sample data
    list_item1: 'りんご',
    list_item2: 'バナナ',
    list_item3: 'さくらんぼ',
    kv_name: '名前',
    kv_version: 'バージョン',
    kv_platform: 'プラットフォーム',
  },
}

export default defineAction({
  description: ({ t }) => t('description'),
  category: 'tutorial',
  tags: ['output', 'tui'],
  translations,
  run: async ({ tui, t }) => {
    tui.output.section(t('title'))
    tui.output.newline()

    // 1. Log levels
    tui.output.step(1, t('section_log_levels'))
    tui.output.log(t('log_general'))
    tui.output.success(t('log_success'))
    tui.output.error(t('log_error'))
    tui.output.warn(t('log_warn'))
    tui.output.info(t('log_info'))
    tui.output.newline()

    // 2. Structured output
    tui.output.step(2, t('section_structured'))

    // List
    tui.output.info(t('list_label'))
    tui.output.list([t('list_item1'), t('list_item2'), t('list_item3')])

    // Key-Value
    tui.output.info(t('keyvalue_label'))
    tui.output.keyValue({
      [t('kv_name')]: 'arere',
      [t('kv_version')]: '0.1.0',
      [t('kv_platform')]: process.platform,
    })

    // Table
    tui.output.info(t('table_label'))
    tui.output.table([
      { [t('table_method')]: 'log()', [t('table_purpose')]: t('table_general_output') },
      { [t('table_method')]: 'success()', [t('table_purpose')]: t('table_success_messages') },
      { [t('table_method')]: 'error()', [t('table_purpose')]: t('table_error_messages') },
    ])

    // JSON
    tui.output.info(t('json_label'))
    tui.output.json({ nested: { data: 'value' }, array: [1, 2, 3] })
    tui.output.newline()

    // 3. Formatting
    tui.output.step(3, t('section_formatting'))

    tui.output.info(t('section_label'))
    tui.output.info(t('step_label'))
    tui.output.info(t('separator_label'))
    tui.output.separator()
    tui.output.separator('=', 40)

    tui.output.info(t('code_label'))
    tui.output.code('const greeting = "Hello!"\nconsole.log(greeting)')
    tui.output.newline()

    // Completion
    tui.output.separator()
    tui.output.success(t('completed'))
    tui.output.info(t('next_step'))
  },
})
