/**
 * StepFormScreen - Multi-step form (wizard) component
 */

import { t } from '@/i18n'
import {
  ConfirmInput,
  MultiSelectInput,
  NumberInput,
  PasswordInput,
  SelectInput,
  TextInput,
} from '@/ui/components/inputs'
import { useKeyBindingHints } from '@/ui/hooks/useKeyBindingHints'
import { useKeyBindings } from '@/ui/hooks/useKeyBindings'
import { usePageMeta } from '@/ui/hooks/usePageMeta'
import type { FormField, FormFields, FormPage, StepFormOptions } from '@/ui/prompts/form/types'
import { Box, Text, useInput } from 'ink'
import React from 'react'
import { useCallback, useMemo, useState } from 'react'
import { StepIndicator, StepNavigation, useStepNavigation } from './components'

export interface StepFormScreenProps {
  /** Array of form pages (steps) */
  steps: FormPage<FormFields>[]
  /** Step form options */
  options?: StepFormOptions<FormFields[]>
  /** Callback when form is submitted with all values */
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
 * Initialize step values from form definition
 */
function initializeStepValues(steps: FormPage<FormFields>[]): Record<string, unknown>[] {
  return steps.map((step) => {
    const values: Record<string, unknown> = {}
    for (const [key, field] of getFieldEntries(step.fields)) {
      values[key] = getDefaultValue(field)
    }
    return values
  })
}

/**
 * StepFormScreen component
 */
export const StepFormScreen: React.FC<StepFormScreenProps> = ({
  steps,
  options,
  onSubmit,
  onCancel,
}) => {
  const hints = useKeyBindingHints()

  // Current step index
  const [currentStep, setCurrentStep] = useState(0)

  // Current step's form definition (for usePageMeta)
  const currentFormForMeta = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  // Set page meta for step form
  usePageMeta({
    breadcrumb: currentFormForMeta?.title
      ? [t('ui:breadcrumb.home'), t('ui:breadcrumb.form'), currentFormForMeta.title]
      : [t('ui:breadcrumb.home'), t('ui:breadcrumb.form')],
    hint: hints.stepForm(isFirstStep, isLastStep),
  })

  // Values for each step
  const [stepValues, setStepValues] = useState<Record<string, unknown>[]>(() =>
    initializeStepValues(steps),
  )

  // Current step's form definition
  const currentForm = steps[currentStep]
  const fieldEntries = useMemo(() => getFieldEntries(currentForm.fields), [currentForm.fields])

  // Focused field index within current step (-1 means navigation is focused)
  const [focusedIndex, setFocusedIndex] = useState(0)

  // Whether navigation buttons are focused
  const isNavigationFocused = focusedIndex === -1

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [stepError, setStepError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  // Get current step values
  const currentValues = stepValues[currentStep]

  // Update a field value in current step
  const updateValue = useCallback(
    (key: string, value: unknown) => {
      setStepValues((prev) => {
        const next = [...prev]
        next[currentStep] = { ...next[currentStep], [key]: value }
        return next
      })
      // Clear errors when value changes
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      setStepError(null)
      setFormError(null)
    },
    [currentStep],
  )

  // Validate current step
  const validateCurrentStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    // Field-level validation
    for (const [key, field] of fieldEntries) {
      const value = currentValues[key]

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
        // Merge all step values for cross-field reference
        const allValues = Object.assign({}, ...stepValues)
        const result = field.validate(value as never, { values: allValues })
        if (result !== true) {
          newErrors[key] = typeof result === 'string' ? result : 'Invalid value'
          isValid = false
        }
      }
    }

    setErrors(newErrors)

    // Step-level validation
    if (isValid && currentForm.validate) {
      const result = currentForm.validate(currentValues as never)
      if (result !== true) {
        setStepError(typeof result === 'string' ? result : 'Validation failed')
        isValid = false
      }
    }

    return isValid
  }, [fieldEntries, currentValues, currentForm, stepValues])

  // Go to next step
  const goNext = useCallback(() => {
    if (!validateCurrentStep()) return

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
      setFocusedIndex(0)
      setErrors({})
      setStepError(null)
    }
  }, [currentStep, steps.length, validateCurrentStep])

  // Go to previous step
  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
      setFocusedIndex(0)
      setErrors({})
      setStepError(null)
    }
  }, [currentStep])

  // Submit the entire form
  const handleSubmit = useCallback(() => {
    if (!validateCurrentStep()) return

    // Merge all step values
    const mergedValues = Object.assign({}, ...stepValues)

    // Cross-step validation
    if (options?.validate) {
      const result = options.validate(mergedValues as never)
      if (result !== true) {
        setFormError(typeof result === 'string' ? result : 'Validation failed')
        return
      }
    }

    onSubmit(mergedValues)
  }, [validateCurrentStep, stepValues, options, onSubmit])

  const kb = useKeyBindings()

  // Navigation button state
  const {
    selectedButton,
    moveLeft: moveNavLeft,
    moveRight: moveNavRight,
  } = useStepNavigation(isFirstStep)

  // Keyboard navigation
  useInput((input, key) => {
    // Global cancel (Escape)
    if (kb.input.cancel(input, key)) {
      onCancel()
      return
    }

    // When navigation buttons are focused
    if (isNavigationFocused) {
      // Left/Right to move between buttons
      if (key.leftArrow) {
        moveNavLeft()
        return
      }
      if (key.rightArrow) {
        moveNavRight()
        return
      }

      // Enter to execute selected button
      if (kb.input.submit(input, key)) {
        switch (selectedButton) {
          case 'back':
            goBack()
            break
          case 'cancel':
            onCancel()
            break
          case 'next':
            if (isLastStep) {
              handleSubmit()
            } else {
              goNext()
            }
            break
        }
        return
      }

      // Tab/Shift+Tab to go back to fields
      if (kb.form.nextField(input, key)) {
        setFocusedIndex(0)
        return
      }
      if (kb.form.prevField(input, key)) {
        setFocusedIndex(fieldEntries.length - 1)
        return
      }
      return
    }

    // When a field is focused
    // Next field (Tab)
    if (kb.form.nextField(input, key)) {
      if (focusedIndex === fieldEntries.length - 1) {
        // Move to navigation buttons
        setFocusedIndex(-1)
      } else {
        setFocusedIndex((prev) => prev + 1)
      }
      return
    }

    // Prev field (Shift+Tab)
    if (kb.form.prevField(input, key)) {
      if (focusedIndex === 0) {
        // Move to navigation buttons
        setFocusedIndex(-1)
      } else {
        setFocusedIndex((prev) => prev - 1)
      }
      return
    }

    // Next step (Ctrl+Right)
    if (kb.form.nextStep(input, key)) {
      goNext()
      return
    }

    // Prev step (Ctrl+Left)
    if (kb.form.prevStep(input, key)) {
      goBack()
      return
    }

    // Enter on last field - go next or submit
    if (kb.input.submit(input, key) && focusedIndex === fieldEntries.length - 1) {
      if (isLastStep) {
        handleSubmit()
      } else {
        goNext()
      }
      return
    }

    // Ctrl+Enter - submit from any field (on last step)
    if (kb.form.submit(input, key) && isLastStep) {
      handleSubmit()
      return
    }
  })

  return (
    <Box flexDirection="column" padding={1}>
      {/* Step indicator */}
      <Box marginBottom={1}>
        <StepIndicator
          currentStep={currentStep}
          totalSteps={steps.length}
          title={currentForm.title}
        />
      </Box>

      {/* Description */}
      {currentForm.description && (
        <Box marginBottom={1}>
          <Text dimColor>{currentForm.description}</Text>
        </Box>
      )}

      {/* Fields */}
      <Box flexDirection="column">
        {fieldEntries.map(([key, field], index) => (
          <Box key={key} flexDirection="column" marginTop={index > 0 ? 1 : 0}>
            <FormFieldRenderer
              fieldKey={key}
              field={field}
              value={currentValues[key]}
              onChange={(v) => updateValue(key, v)}
              isFocused={focusedIndex === index}
              error={errors[key]}
              allValues={Object.assign({}, ...stepValues)}
            />
          </Box>
        ))}
      </Box>

      {/* Step error */}
      {stepError && (
        <Box marginTop={1}>
          <Text color="red">{stepError}</Text>
        </Box>
      )}

      {/* Form error (cross-step validation) */}
      {formError && (
        <Box marginTop={1}>
          <Text color="red">{formError}</Text>
        </Box>
      )}

      {/* Navigation buttons */}
      <Box marginTop={1}>
        <StepNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          canGoBack={!isFirstStep}
          canGoForward={true}
          backLabel={currentForm.cancelLabel ? undefined : 'Back'}
          submitLabel={currentForm.submitLabel ?? 'Submit'}
          cancelLabel={currentForm.cancelLabel ?? 'Cancel'}
          isFocused={isNavigationFocused}
          selectedButton={selectedButton}
        />
      </Box>

      {/* Help */}
      <Box marginTop={1}>
        <Text dimColor>{hints.stepForm(isFirstStep, isLastStep)}</Text>
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
