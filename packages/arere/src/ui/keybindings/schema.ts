import { z } from 'zod'

/**
 * 単一キーバインドのスキーマ
 */
export const keyBindingSchema = z.object({
  key: z.string(),
  ctrl: z.boolean().optional(),
  meta: z.boolean().optional(),
  shift: z.boolean().optional(),
})

/**
 * グローバル操作のキーバインドスキーマ
 */
export const globalKeyBindingsSchema = z.object({
  exit: z.array(keyBindingSchema).optional(),
  search: z.array(keyBindingSchema).optional(),
  help: z.array(keyBindingSchema).optional(),
  settings: z.array(keyBindingSchema).optional(),
  back: z.array(keyBindingSchema).optional(),
  confirm: z.array(keyBindingSchema).optional(),
})

/**
 * リスト操作のキーバインドスキーマ
 */
export const listKeyBindingsSchema = z.object({
  up: z.array(keyBindingSchema).optional(),
  down: z.array(keyBindingSchema).optional(),
  select: z.array(keyBindingSchema).optional(),
  toggle: z.array(keyBindingSchema).optional(),
})

/**
 * 入力操作のキーバインドスキーマ
 */
export const inputKeyBindingsSchema = z.object({
  submit: z.array(keyBindingSchema).optional(),
  cancel: z.array(keyBindingSchema).optional(),
  prev: z.array(keyBindingSchema).optional(),
  next: z.array(keyBindingSchema).optional(),
  toggle: z.array(keyBindingSchema).optional(),
  delete: z.array(keyBindingSchema).optional(),
})

/**
 * 確認入力のキーバインドスキーマ
 */
export const confirmKeyBindingsSchema = z.object({
  yes: z.array(keyBindingSchema).optional(),
  no: z.array(keyBindingSchema).optional(),
})

/**
 * フォーム操作のキーバインドスキーマ
 */
export const formKeyBindingsSchema = z.object({
  nextField: z.array(keyBindingSchema).optional(),
  prevField: z.array(keyBindingSchema).optional(),
  submit: z.array(keyBindingSchema).optional(),
  nextStep: z.array(keyBindingSchema).optional(),
  prevStep: z.array(keyBindingSchema).optional(),
})

/**
 * 設定画面のキーバインドスキーマ
 */
export const settingsKeyBindingsSchema = z.object({
  reset: z.array(keyBindingSchema).optional(),
})

/**
 * キーバインド設定全体のスキーマ
 */
export const keyBindingsConfigSchema = z.object({
  global: globalKeyBindingsSchema.optional(),
  list: listKeyBindingsSchema.optional(),
  input: inputKeyBindingsSchema.optional(),
  confirm: confirmKeyBindingsSchema.optional(),
  form: formKeyBindingsSchema.optional(),
  settings: settingsKeyBindingsSchema.optional(),
})
