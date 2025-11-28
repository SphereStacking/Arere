/**
 * FormScreen - Multi-field form prompt component
 */

import type { FormField, FormFields, FormPage } from '@/infrastructure/prompt/form/types'
import {
  ConfirmInput,
  MultiSelectInput,
  NumberInput,
  PasswordInput,
  SelectInput,
  TextInput,
} from '@/presentation/ui/components/inputs'
import { useKeyBindingHints } from '@/presentation/ui/hooks/useKeyBindingHints'
import { useKeyBindings } from '@/presentation/ui/hooks/useKeyBindings'
import { usePageMeta } from '@/presentation/ui/hooks/usePageMeta'
import { Box, Text, useInput } from 'ink'
import React from 'react'
import { useCallback, useMemo, useState } from 'react'

export interface FormScreenProps {
  /** Form definition */
  form: FormPage<FormFields>
  /** Callback when form is submitted */
  onSubmit: (values: Record<string, unknown>) => void
  /** Callback when form is cancelled */
  onCancel: () => void
}

/**
 * Get field entries from form (preserves order)
 */
function getFieldEntries(fields: FormFields): [string, FormField][] {
  return Object.entries(fields) as [string, FormField][]
}

/**
 * Get default value for a field
 */
function getDefaultValue(field: FormField): unknown {
  switch (field.type) {
    case 'text':
      return field.defaultValue ?? ''
    case 'password':
      // PasswordFormField doesn't have defaultValue (security reason)
      return ''
    case 'number':
      return field.defaultValue ?? 0
    case 'select':
      return field.defaultValue ?? null
    case 'confirm':
      return field.defaultValue ?? false
    case 'multiSelect':
      return field.defaultValue ?? []
    default:
      return ''
  }
}

/**
 * FormScreen component - displays multiple form fields
 */
export const FormScreen: React.FC<FormScreenProps> = ({ form, onSubmit, onCancel }) => {
  const fieldEntries = useMemo(() => getFieldEntries(form.fields), [form.fields])
  const hints = useKeyBindingHints()

  // Set page meta for form
  usePageMeta({
    breadcrumb: form.title ? ['home', 'form', form.title] : ['home', 'form'],
    hint: hints.form(),
  })

  // Form state
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {}
    for (const [key, field] of fieldEntries) {
      initial[key] = getDefaultValue(field)
    }
    return initial
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  // Update a single field value
  const updateValue = useCallback((key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    // Clear field error when value changes
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setFormError(null)
  }, [])

  // Validate all fields
  const validateAll = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    // Field-level validation
    for (const [key, field] of fieldEntries) {
      const value = values[key]

      // Required check
      if (field.required !== false) {
        if (value === '' || value === null || value === undefined) {
          newErrors[key] = `${field.message} is required`
          isValid = false
          continue
        }
      }

      // Custom validation
      if (field.validate) {
        const result = field.validate(value as never, { values })
        if (result !== true) {
          newErrors[key] = typeof result === 'string' ? result : 'Invalid value'
          isValid = false
        }
      }
    }

    setErrors(newErrors)

    // Form-level validation
    if (isValid && form.validate) {
      const result = form.validate(values as never)
      if (result !== true) {
        setFormError(typeof result === 'string' ? result : 'Validation failed')
        isValid = false
      }
    }

    return isValid
  }, [fieldEntries, values, form])

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (validateAll()) {
      onSubmit(values)
    }
  }, [validateAll, values, onSubmit])

  const kb = useKeyBindings()

  // Keyboard navigation
  useInput((input, key) => {
    if (kb.input.cancel(input, key)) {
      onCancel()
      return
    }

    // Next field (with wrap-around)
    if (kb.form.nextField(input, key)) {
      setFocusedIndex((prev) => (prev + 1) % fieldEntries.length)
      return
    }
    // Prev field (with wrap-around)
    if (kb.form.prevField(input, key)) {
      setFocusedIndex((prev) => (prev - 1 + fieldEntries.length) % fieldEntries.length)
      return
    }

    // Submit (Ctrl+Enter or Enter on last field)
    if (
      kb.form.submit(input, key) ||
      (kb.input.submit(input, key) && focusedIndex === fieldEntries.length - 1)
    ) {
      handleSubmit()
      return
    }
  })

  return (
    <Box flexDirection="column" padding={1}>
      {/* Title */}
      {form.title && (
        <Box marginBottom={1}>
          <Text bold color="cyan">
            {form.title}
          </Text>
        </Box>
      )}

      {/* Description */}
      {form.description && (
        <Box marginBottom={1}>
          <Text dimColor>{form.description}</Text>
        </Box>
      )}

      {/* Fields */}
      <Box flexDirection="column">
        {fieldEntries.map(([key, field], index) => (
          <Box key={key} flexDirection="column" marginTop={index > 0 ? 1 : 0}>
            <FormFieldRenderer
              fieldKey={key}
              field={field}
              value={values[key]}
              onChange={(v) => updateValue(key, v)}
              isFocused={focusedIndex === index}
              error={errors[key]}
              allValues={values}
            />
          </Box>
        ))}
      </Box>

      {/* Form error */}
      {formError && (
        <Box marginTop={1}>
          <Text color="red">{formError}</Text>
        </Box>
      )}

      {/* Buttons */}
      <Box marginTop={1} gap={2}>
        <Text color="green">[{form.submitLabel ?? 'Submit'}]</Text>
        <Text color="gray">[{form.cancelLabel ?? 'Cancel'}]</Text>
      </Box>

      {/* Help */}
      <Box marginTop={1}>
        <Text dimColor>{hints.form()}</Text>
      </Box>
    </Box>
  )
}

/**
 * FormFieldRenderer - renders appropriate field component based on type
 */
interface FormFieldRendererProps {
  fieldKey: string
  field: FormField
  value: unknown
  onChange: (value: unknown) => void
  isFocused: boolean
  error?: string
  allValues: Record<string, unknown>
}

const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
  fieldKey,
  field,
  value,
  onChange,
  isFocused,
  error,
}) => {
  switch (field.type) {
    case 'text':
      return (
        <TextInput
          mode="form"
          message={field.message}
          description={field.description}
          placeholder={field.placeholder}
          prefix={field.prefix}
          suffix={field.suffix}
          maxLength={field.maxLength}
          minLength={field.minLength}
          pattern={field.pattern}
          value={value as string}
          onChange={onChange}
          isFocused={isFocused}
          error={error}
        />
      )
    case 'number':
      return (
        <NumberInput
          mode="form"
          message={field.message}
          description={field.description}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          value={value as number}
          onChange={onChange}
          isFocused={isFocused}
          error={error}
        />
      )
    case 'password':
      return (
        <PasswordInput
          mode="form"
          message={field.message}
          description={field.description}
          placeholder={field.placeholder}
          value={value as string}
          onChange={onChange}
          isFocused={isFocused}
          error={error}
        />
      )
    case 'select':
      return (
        <SelectInput
          mode="form"
          message={field.message}
          description={field.description}
          options={field.choices}
          value={value}
          onChange={onChange}
          isFocused={isFocused}
          error={error}
        />
      )
    case 'confirm':
      return (
        <ConfirmInput
          mode="form"
          label={field.message}
          description={field.description}
          value={value as boolean}
          onChange={onChange}
          isFocused={isFocused}
          error={error}
        />
      )
    case 'multiSelect':
      return (
        <MultiSelectInput
          mode="form"
          message={field.message}
          description={field.description}
          options={field.choices}
          min={field.min}
          max={field.max}
          value={value as unknown[]}
          onChange={onChange}
          isFocused={isFocused}
          error={error}
        />
      )
    default:
      return <Text color="red">Unknown field type</Text>
  }
}
