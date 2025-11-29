/**
 * Prompt renderer - converts PromptRequest to appropriate UI component
 *
 * Uses Zustand stores for state management.
 */

import type { SelectChoice } from '@/domain/action/types'
import { t } from '@/infrastructure/i18n/index'
import {
  ConfirmInput,
  MultiSelectInput,
  NumberInput,
  PasswordInput,
  SelectInput,
  TextInput,
  WaitForKeyInput,
} from '@/presentation/ui/components/inputs'
import { useKeyBindingHints } from '@/presentation/ui/hooks/useKeyBindingHints'
import { usePageMeta } from '@/presentation/ui/hooks/usePageMeta'
import { usePromptStore } from '@/presentation/ui/stores/promptStore'
import { Text } from 'ink'
import React from 'react'
import { FormScreen } from './form/FormScreen'
import { StepFormScreen } from './form/StepFormScreen'

/**
 * Get hint based on prompt type
 */
function getPromptHint(type: string, hints: ReturnType<typeof useKeyBindingHints>): string {
  switch (type) {
    case 'text':
    case 'password':
      return hints.textInput()
    case 'number':
      return hints.numberInput()
    case 'confirm':
      return hints.confirm()
    case 'select':
      return hints.editingSelect()
    case 'multiSelect':
      return hints.multiSelect()
    case 'form':
      return hints.form()
    case 'stepForm':
      return '' // StepFormScreen handles its own hint
    default:
      return hints.back()
  }
}

/**
 * Prompt screen component
 */
export const PromptScreen: React.FC = () => {
  // Get state from stores
  const promptRequest = usePromptStore((s) => s.promptRequest)
  const onSubmit = usePromptStore((s) => s.submitPrompt)
  const onCancel = usePromptStore((s) => s.cancelPrompt)
  const hints = useKeyBindingHints()

  // Set page meta for non-form prompts
  // Form/StepForm screens handle their own breadcrumb
  usePageMeta({
    breadcrumb:
      promptRequest?.type === 'form' || promptRequest?.type === 'stepForm'
        ? undefined
        : [t('ui:breadcrumb.home'), t('ui:breadcrumb.input')],
    hint:
      promptRequest?.type === 'form' || promptRequest?.type === 'stepForm'
        ? undefined
        : promptRequest
          ? getPromptHint(promptRequest.type, hints)
          : undefined,
  })

  if (!promptRequest) {
    return <Text>{t('ui:input.loading')}</Text>
  }

  switch (promptRequest.type) {
    case 'text':
      return (
        <TextInput
          mode="standalone"
          label={promptRequest.message}
          placeholder={promptRequest.options?.placeholder}
          initialValue={promptRequest.options?.defaultValue}
          prefix={promptRequest.options?.prefix}
          suffix={promptRequest.options?.suffix}
          maxLength={promptRequest.options?.maxLength}
          minLength={promptRequest.options?.minLength}
          pattern={promptRequest.options?.pattern}
          format={promptRequest.options?.format}
          validate={
            promptRequest.options?.validate
              ? (value: string) => {
                  const result = promptRequest.options?.validate?.(value)
                  return result === true ? undefined : String(result)
                }
              : undefined
          }
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )

    case 'number':
      return (
        <NumberInput
          mode="standalone"
          label={promptRequest.message}
          placeholder={promptRequest.options?.placeholder}
          initialValue={promptRequest.options?.defaultValue}
          min={promptRequest.options?.min}
          max={promptRequest.options?.max}
          validate={
            promptRequest.options?.validate
              ? (value: number) => {
                  const result = promptRequest.options?.validate?.(value)
                  return result === true ? undefined : String(result)
                }
              : undefined
          }
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )

    case 'password':
      return (
        <PasswordInput
          mode="standalone"
          label={promptRequest.message}
          placeholder={promptRequest.options?.placeholder}
          minLength={promptRequest.options?.minLength}
          validate={
            promptRequest.options?.validate
              ? (value: string) => {
                  const result = promptRequest.options?.validate?.(value)
                  return result === true ? undefined : String(result)
                }
              : undefined
          }
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )

    case 'select':
      return (
        <SelectInput
          mode="standalone"
          label={promptRequest.message}
          options={promptRequest.choices as SelectChoice<unknown>[]}
          onSelect={onSubmit}
          onCancel={onCancel}
        />
      )

    case 'confirm':
      return (
        <ConfirmInput
          mode="standalone"
          message={promptRequest.message}
          defaultValue={promptRequest.options?.defaultValue}
          onConfirm={onSubmit}
        />
      )

    case 'multiSelect':
      return (
        <MultiSelectInput
          mode="standalone"
          label={promptRequest.message}
          options={promptRequest.choices as SelectChoice<unknown>[]}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )

    case 'waitForEnter':
      return (
        <WaitForKeyInput
          message={promptRequest.message || 'Press Enter to continue...'}
          keys={[]}
          onSubmit={() => onSubmit(undefined)}
        />
      )

    case 'waitForKey':
      return (
        <WaitForKeyInput
          message={promptRequest.message}
          keys={promptRequest.keys}
          caseInsensitive={promptRequest.caseInsensitive}
          onSubmit={onSubmit}
        />
      )

    case 'form':
      return <FormScreen form={promptRequest.form} onSubmit={onSubmit} onCancel={onCancel} />

    case 'stepForm':
      return (
        <StepFormScreen
          steps={promptRequest.steps}
          options={promptRequest.options}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )

    default:
      return <Text>{t('ui:error.unknown_prompt_type')}</Text>
  }
}
