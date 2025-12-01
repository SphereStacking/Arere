/**
 * Create Plugin Action
 * Generate a new arere plugin from template
 */

import { mkdir, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { defineAction } from 'arere'
import { getAuthorEmail, getAuthorName } from '../src/git-utils'
import { type PluginTemplateOptions, renderPluginTemplate } from '../src/plugin-template-renderer'

export default defineAction({
  name: 'create-plugin',
  description: ({ t }) => t('plugin:createPlugin.description'),
  category: 'create',
  tags: ['create', 'plugin', 'scaffold'],

  async run({ tui, t }) {
    // Header
    tui.output.section(t('plugin:createPlugin.title'))
    tui.output.newline()

    // Step 1: Plugin Name
    const pluginName = await tui.prompt.text(t('plugin:createPlugin.prompt.pluginName'), {
      prefix: 'arere-plugin-',
      format: 'kebab-case',
      pattern: /^[a-z0-9-]+$/,
      maxLength: 50,
      placeholder: 'example',
      arg: 'name',
      argShort: 'n',
      description: 'Plugin name (without arere-plugin- prefix)',
      validate: (value) => {
        if (!value) {
          return t('plugin:createPlugin.validation.required')
        }
        return true
      },
    })

    // Step 2: Description
    const description = await tui.prompt.text(t('plugin:createPlugin.prompt.description'), {
      placeholder: 'My awesome arere plugin',
      arg: 'description',
      argShort: 'd',
      description: 'Plugin description',
      validate: (value) => {
        if (!value) {
          return t('plugin:createPlugin.validation.required')
        }
        return true
      },
    })

    // Step 3: Author (with git config default)
    const gitAuthor = await getAuthorName('')
    const author = await tui.prompt.text(t('plugin:createPlugin.prompt.author'), {
      placeholder: gitAuthor || 'Your Name',
      defaultValue: gitAuthor,
      arg: 'author',
      argShort: 'a',
      description: 'Author name',
    })

    // Step 4: Email (with git config default)
    const gitEmail = await getAuthorEmail('')
    const authorEmail = await tui.prompt.text(t('plugin:createPlugin.prompt.email'), {
      placeholder: gitEmail || 'you@example.com',
      defaultValue: gitEmail,
      arg: 'email',
      argShort: 'e',
      description: 'Author email',
      validate: (value) => {
        if (!value) {
          return t('plugin:createPlugin.validation.required')
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return t('plugin:createPlugin.validation.emailFormat')
        }
        return true
      },
    })

    // Step 5: Template Type
    const template = await tui.prompt.select<PluginTemplateOptions['template']>(
      t('plugin:createPlugin.prompt.template'),
      [
        {
          label: t('plugin:createPlugin.templates.minimal.label'),
          value: 'minimal',
          description: t('plugin:createPlugin.templates.minimal.description'),
        },
        {
          label: t('plugin:createPlugin.templates.standard.label'),
          value: 'standard',
          description: t('plugin:createPlugin.templates.standard.description'),
        },
        {
          label: t('plugin:createPlugin.templates.full.label'),
          value: 'full',
          description: t('plugin:createPlugin.templates.full.description'),
        },
      ],
      {
        arg: 'template',
        argShort: 't',
        description: 'Template type (minimal/standard/full)',
      },
    )

    // Step 6: Output Directory
    const defaultOutputDir = `./${pluginName}`
    const outputDir = await tui.prompt.text(t('plugin:createPlugin.prompt.outputDir'), {
      placeholder: defaultOutputDir,
      defaultValue: defaultOutputDir,
      arg: 'output-dir',
      argShort: 'o',
      description: 'Output directory',
    })

    const resolvedOutputDir = resolve(outputDir)

    // Check if directory already exists
    try {
      await stat(resolvedOutputDir)
      const overwrite = await tui.prompt.confirm(
        t('plugin:createPlugin.prompt.overwrite', { dir: resolvedOutputDir }),
        {
          defaultValue: false,
          arg: 'overwrite',
          argShort: 'y',
          description: 'Overwrite existing directory',
        },
      )
      if (!overwrite) {
        tui.output.info(t('plugin:createPlugin.cancelled'))
        return
      }
    } catch {
      // Directory doesn't exist, proceed
    }

    // Create output directory
    await mkdir(resolvedOutputDir, { recursive: true })

    // Show summary
    tui.output.newline()
    tui.output.info(t('plugin:createPlugin.summary'))
    tui.output.info(`  ${t('plugin:createPlugin.summaryFields.name')}: ${pluginName}`)
    tui.output.info(`  ${t('plugin:createPlugin.summaryFields.description')}: ${description}`)
    tui.output.info(
      `  ${t('plugin:createPlugin.summaryFields.author')}: ${author} <${authorEmail}>`,
    )
    tui.output.info(`  ${t('plugin:createPlugin.summaryFields.template')}: ${template}`)
    tui.output.info(`  ${t('plugin:createPlugin.summaryFields.outputDir')}: ${resolvedOutputDir}`)
    tui.output.newline()

    // Render template
    tui.output.info(t('plugin:createPlugin.rendering'))

    try {
      await renderPluginTemplate(
        {
          pluginName,
          description,
          author,
          authorEmail,
          template,
        },
        resolvedOutputDir,
      )

      // Success!
      tui.output.newline()
      tui.output.success(t('plugin:createPlugin.success'))
      tui.output.newline()

      // Next steps
      tui.output.info(t('plugin:createPlugin.nextSteps'))
      tui.output.newline()
      tui.output.info(`  cd ${outputDir}`)
      tui.output.info('  npm install')
      tui.output.info('  npm run build')
      tui.output.newline()
    } catch (error) {
      tui.output.newline()
      tui.output.error(
        t('plugin:createPlugin.error', {
          message: error instanceof Error ? error.message : String(error),
        }),
      )
    }
  },
})
