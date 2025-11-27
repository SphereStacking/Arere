/**
 * Template rendering utilities
 */

export interface TemplatePlaceholders {
  name: string // Action name (kebab-case)
  Name: string // Action name (PascalCase)
  description: string // Description
  category: string // Category
  tags: string[] // Tags array
  tagsJson: string // JSON array string
}

/**
 * Convert kebab-case to PascalCase
 * @example kebabToPascal('my-action') => 'MyAction'
 */
export function kebabToPascal(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

/**
 * Create placeholders from user input
 */
export function createPlaceholders(input: {
  name: string
  description: string
  category: string
  tags: string[]
}): TemplatePlaceholders {
  return {
    name: input.name,
    Name: kebabToPascal(input.name),
    description: input.description,
    category: input.category,
    tags: input.tags,
    tagsJson: JSON.stringify(input.tags),
  }
}

/**
 * Render template with placeholders
 */
export function renderTemplate(template: string, placeholders: TemplatePlaceholders): string {
  let result = template

  // Replace all placeholders
  result = result.replace(/\{\{name\}\}/g, placeholders.name)
  result = result.replace(/\{\{Name\}\}/g, placeholders.Name)
  result = result.replace(/\{\{description\}\}/g, placeholders.description)
  result = result.replace(/\{\{category\}\}/g, placeholders.category)
  result = result.replace(/\{\{tags\}\}/g, placeholders.tagsJson)

  return result
}
