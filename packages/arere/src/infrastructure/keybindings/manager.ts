/**
 * キーバインディングマネージャー
 *
 * keybindings.jsonの読み込み・マージを行う
 */

import fs from 'node:fs'
import type { KeyBindingsConfig, PartialKeyBindingsConfig } from '@/domain/keybindings'
import { getKeybindingsPath } from '@/infrastructure/config/paths'
import type { ConfigLayer } from '@/infrastructure/config/types'
import { logger } from '@/shared/utils/logger'
import { defaultKeyBindings } from './defaults'
import { type UserKeyBinding, parseUserKeyBindings } from './parser'

/**
 * ユーザー設定ファイルの形式（ネスト形式）
 */
export interface UserKeybindingsFile {
  global?: {
    exit?: UserKeyBinding[]
    search?: UserKeyBinding[]
    help?: UserKeyBinding[]
    settings?: UserKeyBinding[]
    back?: UserKeyBinding[]
    confirm?: UserKeyBinding[]
  }
  list?: {
    up?: UserKeyBinding[]
    down?: UserKeyBinding[]
    select?: UserKeyBinding[]
    toggle?: UserKeyBinding[]
    bookmark?: UserKeyBinding[]
  }
  input?: {
    submit?: UserKeyBinding[]
    cancel?: UserKeyBinding[]
    prev?: UserKeyBinding[]
    next?: UserKeyBinding[]
    toggle?: UserKeyBinding[]
    delete?: UserKeyBinding[]
  }
  confirm?: {
    yes?: UserKeyBinding[]
    no?: UserKeyBinding[]
  }
  form?: {
    nextField?: UserKeyBinding[]
    prevField?: UserKeyBinding[]
    submit?: UserKeyBinding[]
    nextStep?: UserKeyBinding[]
    prevStep?: UserKeyBinding[]
  }
  settings?: {
    reset?: UserKeyBinding[]
  }
}

/**
 * ユーザー設定ファイルを内部形式に変換
 */
function parseUserKeybindingsFile(userFile: UserKeybindingsFile): PartialKeyBindingsConfig {
  const result: PartialKeyBindingsConfig = {}

  if (userFile.global) {
    result.global = {}
    if (userFile.global.exit) result.global.exit = parseUserKeyBindings(userFile.global.exit)
    if (userFile.global.search) result.global.search = parseUserKeyBindings(userFile.global.search)
    if (userFile.global.help) result.global.help = parseUserKeyBindings(userFile.global.help)
    if (userFile.global.settings)
      result.global.settings = parseUserKeyBindings(userFile.global.settings)
    if (userFile.global.back) result.global.back = parseUserKeyBindings(userFile.global.back)
    if (userFile.global.confirm)
      result.global.confirm = parseUserKeyBindings(userFile.global.confirm)
  }

  if (userFile.list) {
    result.list = {}
    if (userFile.list.up) result.list.up = parseUserKeyBindings(userFile.list.up)
    if (userFile.list.down) result.list.down = parseUserKeyBindings(userFile.list.down)
    if (userFile.list.select) result.list.select = parseUserKeyBindings(userFile.list.select)
    if (userFile.list.toggle) result.list.toggle = parseUserKeyBindings(userFile.list.toggle)
    if (userFile.list.bookmark) result.list.bookmark = parseUserKeyBindings(userFile.list.bookmark)
  }

  if (userFile.input) {
    result.input = {}
    if (userFile.input.submit) result.input.submit = parseUserKeyBindings(userFile.input.submit)
    if (userFile.input.cancel) result.input.cancel = parseUserKeyBindings(userFile.input.cancel)
    if (userFile.input.prev) result.input.prev = parseUserKeyBindings(userFile.input.prev)
    if (userFile.input.next) result.input.next = parseUserKeyBindings(userFile.input.next)
    if (userFile.input.toggle) result.input.toggle = parseUserKeyBindings(userFile.input.toggle)
    if (userFile.input.delete) result.input.delete = parseUserKeyBindings(userFile.input.delete)
  }

  if (userFile.confirm) {
    result.confirm = {}
    if (userFile.confirm.yes) result.confirm.yes = parseUserKeyBindings(userFile.confirm.yes)
    if (userFile.confirm.no) result.confirm.no = parseUserKeyBindings(userFile.confirm.no)
  }

  if (userFile.form) {
    result.form = {}
    if (userFile.form.nextField)
      result.form.nextField = parseUserKeyBindings(userFile.form.nextField)
    if (userFile.form.prevField)
      result.form.prevField = parseUserKeyBindings(userFile.form.prevField)
    if (userFile.form.submit) result.form.submit = parseUserKeyBindings(userFile.form.submit)
    if (userFile.form.nextStep) result.form.nextStep = parseUserKeyBindings(userFile.form.nextStep)
    if (userFile.form.prevStep) result.form.prevStep = parseUserKeyBindings(userFile.form.prevStep)
  }

  if (userFile.settings) {
    result.settings = {}
    if (userFile.settings.reset)
      result.settings.reset = parseUserKeyBindings(userFile.settings.reset)
  }

  return result
}

/**
 * 指定レイヤーのkeybindings.jsonを読み込む
 *
 * @param layer - 設定レイヤー
 * @param cwd - カレントディレクトリ
 * @returns パース済みの部分設定、ファイルがなければnull
 */
export function loadKeybindingsLayer(
  layer: ConfigLayer,
  cwd: string = process.cwd(),
): PartialKeyBindingsConfig | null {
  const filePath = getKeybindingsPath(layer, cwd)

  if (!fs.existsSync(filePath)) {
    return null
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const userFile = JSON.parse(content) as UserKeybindingsFile
    return parseUserKeybindingsFile(userFile)
  } catch (error) {
    logger.warn(`Failed to load keybindings from ${filePath}:`, error)
    return null
  }
}

/**
 * 部分設定をデフォルトとマージ（完全置換方式）
 *
 * @param defaults - デフォルト設定
 * @param partial - 部分設定
 * @returns マージ済み設定
 */
function mergeKeybindings(
  defaults: KeyBindingsConfig,
  partial: PartialKeyBindingsConfig,
): KeyBindingsConfig {
  return {
    global: {
      exit: partial.global?.exit ?? defaults.global.exit,
      search: partial.global?.search ?? defaults.global.search,
      help: partial.global?.help ?? defaults.global.help,
      settings: partial.global?.settings ?? defaults.global.settings,
      back: partial.global?.back ?? defaults.global.back,
      confirm: partial.global?.confirm ?? defaults.global.confirm,
    },
    list: {
      up: partial.list?.up ?? defaults.list.up,
      down: partial.list?.down ?? defaults.list.down,
      select: partial.list?.select ?? defaults.list.select,
      toggle: partial.list?.toggle ?? defaults.list.toggle,
      bookmark: partial.list?.bookmark ?? defaults.list.bookmark,
    },
    input: {
      submit: partial.input?.submit ?? defaults.input.submit,
      cancel: partial.input?.cancel ?? defaults.input.cancel,
      prev: partial.input?.prev ?? defaults.input.prev,
      next: partial.input?.next ?? defaults.input.next,
      toggle: partial.input?.toggle ?? defaults.input.toggle,
      delete: partial.input?.delete ?? defaults.input.delete,
    },
    confirm: {
      yes: partial.confirm?.yes ?? defaults.confirm.yes,
      no: partial.confirm?.no ?? defaults.confirm.no,
    },
    form: {
      nextField: partial.form?.nextField ?? defaults.form.nextField,
      prevField: partial.form?.prevField ?? defaults.form.prevField,
      submit: partial.form?.submit ?? defaults.form.submit,
      nextStep: partial.form?.nextStep ?? defaults.form.nextStep,
      prevStep: partial.form?.prevStep ?? defaults.form.prevStep,
    },
    settings: {
      reset: partial.settings?.reset ?? defaults.settings.reset,
    },
  }
}

/**
 * 全レイヤーをマージしたキーバインディング設定を取得
 *
 * 優先順位: workspace > user > defaults
 *
 * @param cwd - カレントディレクトリ
 * @returns マージ済みのキーバインディング設定
 */
export function loadMergedKeybindings(cwd: string = process.cwd()): KeyBindingsConfig {
  // デフォルトから開始
  let config = defaultKeyBindings

  // ユーザー設定をマージ
  const userConfig = loadKeybindingsLayer('user', cwd)
  if (userConfig) {
    config = mergeKeybindings(config, userConfig)
  }

  // ワークスペース設定をマージ（最優先）
  const workspaceConfig = loadKeybindingsLayer('workspace', cwd)
  if (workspaceConfig) {
    config = mergeKeybindings(config, workspaceConfig)
  }

  return config
}
