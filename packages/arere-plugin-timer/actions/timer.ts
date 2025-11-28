/**
 * Timer Action
 *
 * Simple countdown timer with notification
 */

import { defineAction } from 'arere'
import { playAlarm } from '../src/playSound.js'

/**
 * Parse duration string to milliseconds
 * Supports: 5m, 30s, 1h, 1h30m, 90s, etc.
 */
function parseDuration(input: string): number | null {
  const normalized = input.toLowerCase().trim()

  // Try parsing as total seconds/minutes/hours
  const simpleMatch = normalized.match(/^(\d+)(h|m|s)$/)
  if (simpleMatch) {
    const value = Number.parseInt(simpleMatch[1], 10)
    const unit = simpleMatch[2]
    switch (unit) {
      case 'h':
        return value * 60 * 60 * 1000
      case 'm':
        return value * 60 * 1000
      case 's':
        return value * 1000
    }
  }

  // Try parsing compound format: 1h30m, 5m30s, etc.
  let totalMs = 0
  const hourMatch = normalized.match(/(\d+)h/)
  const minMatch = normalized.match(/(\d+)m/)
  const secMatch = normalized.match(/(\d+)s/)

  if (hourMatch) totalMs += Number.parseInt(hourMatch[1], 10) * 60 * 60 * 1000
  if (minMatch) totalMs += Number.parseInt(minMatch[1], 10) * 60 * 1000
  if (secMatch) totalMs += Number.parseInt(secMatch[1], 10) * 1000

  return totalMs > 0 ? totalMs : null
}

/**
 * Format milliseconds to human-readable string
 */
function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Format duration for display (e.g., "5 minutes")
 */
function formatDuration(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0 && hours === 0) parts.push(`${seconds}s`)

  return parts.join(' ') || '0s'
}

export default defineAction({
  description: ({ t }) => t('plugin:actions.timer.description'),
  category: 'timer',
  tags: ['timer', 'countdown', 'productivity'],
  run: async ({ tui, t }) => {
    // Get duration from user
    const durationInput = await tui.prompt.text(t('plugin:timer.enterDuration'), {
      placeholder: t('plugin:timer.placeholder'),
      validate: (value) => {
        if (!value.trim()) return t('plugin:timer.invalidFormat')
        const ms = parseDuration(value)
        if (!ms) return t('plugin:timer.invalidFormat')
        return true
      },
    })

    const durationMs = parseDuration(durationInput)
    if (!durationMs) return

    tui.output.section('Timer')
    tui.output.success(t('plugin:timer.starting', { duration: formatDuration(durationMs) }))
    tui.output.newline()

    const startTime = Date.now()
    const endTime = startTime + durationMs

    // Use spinner with updating message for countdown
    const spinner = tui.control.spinner({
      message: `⏱️ ${t('plugin:timer.remaining')}: ${formatTime(durationMs)}`,
    })

    spinner.start()

    // Countdown loop - update every second
    while (Date.now() < endTime) {
      const remaining = Math.max(0, endTime - Date.now())
      spinner.update(`⏱️ ${t('plugin:timer.remaining')}: ${formatTime(remaining)}`)
      await tui.control.delay(1000)
    }

    spinner.succeed(`🔔 ${t('plugin:timer.finished')}`)

    // Play alarm sound
    await playAlarm()
  },
})
