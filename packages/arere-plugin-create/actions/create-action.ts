/**
 * Create Action - Interactive action generator
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineAction } from 'arere'
import { type Scope, fileExists, resolveActionDir, writeActionFile } from '../src/file-writer.js'
import { createPlaceholders, renderTemplate } from '../src/template-renderer.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineAction({
  name: 'create-action',
  description: ({ t }) => t('plugin:description'),
  category: 'create',
  tags: ['create', 'action', 'scaffold'],

  async run({ tui, t, cwd }) {
    // Title
    tui.output.section(t('plugin:title'))
    tui.output.newline()

    // Step 1: Get action name
    tui.output.step(1, t('plugin:prompts.name'))
    const name = await tui.prompt.text(t('plugin:prompts.name'), {
      placeholder: 'my-awesome-action',
      validate: (value) => {
        if (!/^[a-z0-9-]+$/.test(value)) {
          return t('plugin:errors.invalid_name')
        }
        return true
      },
    })
    tui.output.success(`Name: ${name}`)
    tui.output.newline()

    // Step 2: Get description
    tui.output.step(2, t('plugin:prompts.description'))
    const description = await tui.prompt.text(t('plugin:prompts.description'), {
      placeholder: 'My awesome action',
      validate: (value) => {
        if (value.trim().length === 0) {
          return t('plugin:errors.empty_description')
        }
        return true
      },
    })
    tui.output.success(`Description: ${description}`)
    tui.output.newline()

    // Step 3: Select category
    tui.output.step(3, t('plugin:prompts.category'))
    const category = await tui.prompt.select(t('plugin:prompts.category'), [
      { label: t('plugin:categories.utility'), value: 'utility' },
      { label: t('plugin:categories.development'), value: 'development' },
      { label: t('plugin:categories.git'), value: 'git' },
      { label: t('plugin:categories.testing'), value: 'testing' },
      { label: t('plugin:categories.demo'), value: 'demo' },
    ])
    tui.output.success(`Category: ${category}`)
    tui.output.newline()

    // Step 4: Select tags
    tui.output.step(4, t('plugin:prompts.tags'))
    const tags = await tui.prompt.multiSelect(t('plugin:prompts.tags'), [
      { label: t('plugin:tags.demo'), value: 'demo' },
      { label: t('plugin:tags.tutorial'), value: 'tutorial' },
      { label: t('plugin:tags.utility'), value: 'utility' },
      { label: t('plugin:tags.git'), value: 'git' },
      { label: t('plugin:tags.test'), value: 'test' },
      { label: t('plugin:tags.dev'), value: 'dev' },
    ])
    tui.output.success(`Tags: ${tags.join(', ')}`)
    tui.output.newline()

    // Step 5: Select template
    tui.output.step(5, t('plugin:prompts.template'))
    const template = await tui.prompt.select<'basic' | 'advanced' | 'with-i18n'>(
      t('plugin:prompts.template'),
      [
        {
          label: t('plugin:templates.basic.label'),
          value: 'basic',
          description: t('plugin:templates.basic.description'),
        },
        {
          label: t('plugin:templates.advanced.label'),
          value: 'advanced',
          description: t('plugin:templates.advanced.description'),
        },
        {
          label: t('plugin:templates.with-i18n.label'),
          value: 'with-i18n',
          description: t('plugin:templates.with-i18n.description'),
        },
      ],
    )
    tui.output.success(`Template: ${template}`)
    tui.output.newline()

    // Step 6: Select scope
    tui.output.step(6, t('plugin:prompts.scope'))
    const scope = await tui.prompt.select<Scope>(t('plugin:prompts.scope'), [
      {
        label: t('plugin:scopes.workspace.label'),
        value: 'workspace',
        description: t('plugin:scopes.workspace.description'),
      },
      {
        label: t('plugin:scopes.global.label'),
        value: 'global',
        description: t('plugin:scopes.global.description'),
      },
    ])
    tui.output.success(`Scope: ${scope}`)
    tui.output.newline()

    // Check if file already exists
    const actionDir = resolveActionDir(scope, cwd)
    const filePath = join(actionDir, `${name}.ts`)
    if (fileExists(filePath)) {
      const overwrite = await tui.prompt.confirm(t('plugin:prompts.overwrite'), {
        defaultValue: false,
      })
      if (!overwrite) {
        tui.output.warn(t('plugin:messages.cancelled'))
        return
      }
    }

    // Read template file
    const templatePath = join(__dirname, '..', 'stubs', `${template}.ts.template`)
    let templateContent: string
    try {
      templateContent = readFileSync(templatePath, 'utf-8')
    } catch (error) {
      tui.output.error(t('plugin:errors.template_not_found', { template }))
      throw error
    }

    // Render template
    const placeholders = createPlaceholders({
      name,
      description,
      category,
      tags,
    })
    const content = renderTemplate(templateContent, placeholders)

    // Write file
    const spinner = tui.control.spinner(t('plugin:messages.creating'))
    spinner.start()

    try {
      const outputPath = writeActionFile({
        scope,
        name,
        content,
        cwd,
      })

      spinner.stop()
      tui.output.newline()

      // Success message
      tui.output.success(t('plugin:messages.success'))
      tui.output.info(t('plugin:messages.file_path', { path: outputPath }))
      tui.output.newline()

      // Next steps
      tui.output.section(t('plugin:messages.next_steps'))
      tui.output.list([t('plugin:messages.restart')])
    } catch (error) {
      spinner.stop()
      throw error
    }
  },
})
