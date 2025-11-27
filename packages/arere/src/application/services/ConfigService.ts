/**
 * ConfigService - Application Layer
 *
 * Service responsible for configuration change business logic
 *
 * - Read/write configuration through FileConfigManager
 * - Calls Infrastructure layer (i18n, logger)
 * - Testable independently from UI layer (Dependency Injection)
 *
 * @remarks
 * This service performs configuration change workflow in the following order:
 * 1. Application layer: Apply business rules (e.g., i18n update on locale change)
 * 2. Infrastructure layer: Persist to file system (Manager)
 * 3. Infrastructure layer: Reload from file system (Manager)
 *
 * @important
 * Repository/Writer have been unified into FileConfigManager.
 * Merge logic is centrally managed by FileConfigManager.
 */

import type { LogLevel } from '@/domain/types/common'
import { FileConfigManager } from '@/infrastructure/config/manager'
import type { ArereConfig } from '@/infrastructure/config/schema'
import type { ConfigLayer } from '@/infrastructure/config/types'
import { changeLocale } from '@/infrastructure/i18n/index'
import { setLogLevel } from '@/shared/utils/logger'

/**
 * Configuration management service
 *
 * @example
 * ```typescript
 * // Simple usage
 * const service = new ConfigService()
 * const newConfig = await service.changeConfig('locale', 'ja', 'workspace')
 *
 * // With custom cwd
 * const service = new ConfigService('/custom/path')
 * ```
 */
export class ConfigService {
  private manager: FileConfigManager

  constructor(cwd?: string) {
    this.manager = new FileConfigManager(cwd)
  }

  /**
   * Change a configuration value
   *
   * @param key - Configuration key (dot notation supported: "theme.primaryColor")
   * @param value - New value
   * @param layer - Target layer to save (default: workspace)
   * @param cwd - Working directory
   * @returns Merged configuration reloaded from file system
   *
   * @remarks
   * This method performs the following steps in order:
   * 1. Apply side effects for specific keys (locale → changeLocale, logLevel → setLogLevel)
   * 2. Save to file system in Infrastructure layer (Manager)
   * 3. Reload from file system in Infrastructure layer (Manager)
   *
   * @important
   * The return value is always merged configuration reloaded from file system.
   * It is not a tentative value based on currentConfig.
   * This ensures workspace > user priority is correctly reflected.
   */
  async changeConfig(
    key: string,
    value: unknown,
    layer: ConfigLayer = 'workspace',
    cwd?: string,
  ): Promise<ArereConfig> {
    // 1. Application layer: Apply side effects based on business rules
    await this.applySideEffects(key, value)

    // 2. Infrastructure layer: Persist to file system (Manager)
    await this.manager.save(layer, key, value, cwd)

    // 3. Infrastructure layer: Reload from file system (Manager)
    // ✅ Get correct merge result (workspace > user > defaults)
    const newConfig = await this.manager.loadMerged(cwd)

    return newConfig
  }

  /**
   * Get current configuration
   *
   * @param cwd - Working directory
   * @returns Merged configuration
   */
  async getConfig(cwd?: string): Promise<ArereConfig> {
    return await this.manager.loadMerged(cwd)
  }

  /**
   * Reset a configuration value
   *
   * @param key - Configuration key (dot notation supported)
   * @param layer - Target layer to reset
   * @param cwd - Working directory
   * @returns Merged configuration reloaded from file system
   */
  async resetConfig(key: string, layer: ConfigLayer, cwd?: string): Promise<ArereConfig> {
    await this.manager.delete(layer, key, cwd)
    return await this.manager.loadMerged(cwd)
  }

  /**
   * Apply side effects of configuration changes
   *
   * @param key - Configuration key
   * @param value - New value
   *
   * @remarks
   * Applies side effects that need to be applied immediately for specific keys:
   * - locale: Change i18n language
   * - logLevel: Change logger log level
   */
  private async applySideEffects(key: string, value: unknown): Promise<void> {
    if (key === 'locale') {
      await changeLocale(value as string)
    } else if (key === 'logLevel') {
      setLogLevel(value as LogLevel)
    }
    // Other settings (e.g., theme.primaryColor) only update state with no side effects
  }
}
