/**
 * Plugin Template Renderer
 * Handles template rendering and placeholder replacement
 */

import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export interface PluginTemplateOptions {
  pluginName: string
  description: string
  author: string
  authorEmail: string
  template: 'minimal' | 'standard' | 'full'
}

export interface TemplateContext {
  pluginName: string
  pluginNameShort: string
  PluginNamePascal: string
  description: string
  author: string
  authorEmail: string
  i18nNamespace: string
  date: string
}

/**
 * Create template context from options
 */
export function createTemplateContext(options: PluginTemplateOptions): TemplateContext {
  // Extract short name (remove arere-plugin- prefix if present)
  const pluginNameShort = options.pluginName.startsWith('arere-plugin-')
    ? options.pluginName.replace('arere-plugin-', '')
    : options.pluginName

  // Convert to PascalCase for class names
  const PluginNamePascal = pluginNameShort
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

  // Use short name as i18n namespace (without arere-plugin- prefix)
  const i18nNamespace = pluginNameShort

  return {
    pluginName: options.pluginName,
    pluginNameShort,
    PluginNamePascal,
    description: options.description,
    author: options.author,
    authorEmail: options.authorEmail,
    i18nNamespace,
    date: new Date().toISOString().split('T')[0],
  }
}

/**
 * Replace placeholders in content
 */
export function replacePlaceholders(content: string, context: TemplateContext): string {
  let result = content

  // Replace all placeholders
  for (const [key, value] of Object.entries(context)) {
    const placeholder = `{{${key}}}`
    const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g')
    result = result.replace(regex, value)
  }

  return result
}

/**
 * Get output file path (remove .template extension)
 */
export function getOutputPath(templatePath: string, outputDir: string): string {
  const relativePath = templatePath.replace(/\.template$/, '')
  const fileName = basename(relativePath)
  const dirPath = dirname(relativePath)
  const relativeDir = dirPath.split('/stubs/plugin/')[1] || ''

  // Remove template type from path (minimal/standard/full)
  const pathParts = relativeDir.split('/')
  pathParts.shift() // Remove template type
  const finalDir = pathParts.join('/')

  return join(outputDir, finalDir, fileName)
}

/**
 * Copy and render template directory recursively
 */
export async function renderTemplateDirectory(
  templateDir: string,
  outputDir: string,
  context: TemplateContext,
): Promise<void> {
  const entries = await readdir(templateDir, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = join(templateDir, entry.name)

    if (entry.isDirectory()) {
      // Recursively process subdirectories
      const targetDir = join(outputDir, entry.name)
      await mkdir(targetDir, { recursive: true })
      await renderTemplateDirectory(sourcePath, targetDir, context)
    } else if (entry.isFile()) {
      // Process template file
      const content = await readFile(sourcePath, 'utf-8')
      const rendered = replacePlaceholders(content, context)

      // Remove .template extension from output file name
      const outputFileName = entry.name.replace(/\.template$/, '')
      const outputPath = join(outputDir, outputFileName)

      // Ensure output directory exists
      await mkdir(dirname(outputPath), { recursive: true })

      // Write rendered file
      await writeFile(outputPath, rendered, 'utf-8')
    }
  }
}

/**
 * Render plugin template
 */
export async function renderPluginTemplate(
  options: PluginTemplateOptions,
  outputDir: string,
): Promise<void> {
  const context = createTemplateContext(options)

  // Get template directory path
  const templateDir = join(__dirname, '../stubs/plugin', options.template)

  // Check if template exists
  try {
    await stat(templateDir)
  } catch (error) {
    throw new Error(`Template '${options.template}' not found`)
  }

  // Render template
  await renderTemplateDirectory(templateDir, outputDir, context)
}
