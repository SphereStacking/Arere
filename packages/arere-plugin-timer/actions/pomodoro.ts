/**
 * Pomodoro Action
 *
 * Pomodoro technique timer
 * - 25min work → 5min break
 * - After 4 cycles, 15min long break
 */

import { defineAction } from 'arere'
import { playAlarm } from '../src/playSound.js'

/**
 * Format milliseconds to MM:SS
 */
function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Format total minutes to human readable
 */
function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak'

export default defineAction({
  description: ({ t }) => t('plugin:actions.pomodoro.description'),
  category: 'timer',
  tags: ['timer', 'pomodoro', 'productivity', 'focus'],
  run: async ({ tui, t }) => {
    tui.output.section(t('plugin:pomodoro.title'))
    tui.output.newline()

    // Configuration
    const workMinutes = await tui.prompt.number(
      t('plugin:pomodoro.workTime'),
      { defaultValue: 25 },
    )

    const breakMinutes = await tui.prompt.number(
      t('plugin:pomodoro.breakTime'),
      { defaultValue: 5 },
    )

    const longBreakMinutes = await tui.prompt.number(
      t('plugin:pomodoro.longBreakTime'),
      { defaultValue: 15 },
    )

    const cyclesBeforeLongBreak = await tui.prompt.number(
      t('plugin:pomodoro.cyclesBeforeLongBreak'),
      { defaultValue: 4 },
    )

    // Pomodoro session
    let totalWorkMinutes = 0
    let currentCycle = 1
    let cancelled = false

    const getPhaseLabel = (phase: PomodoroPhase): string => {
      switch (phase) {
        case 'work': return t('plugin:pomodoro.work')
        case 'shortBreak': return t('plugin:pomodoro.shortBreak')
        case 'longBreak': return t('plugin:pomodoro.longBreak')
      }
    }

    const getPhaseEmoji = (phase: PomodoroPhase): string => {
      switch (phase) {
        case 'work': return '🍅'
        case 'shortBreak': return '☕'
        case 'longBreak': return '🌴'
      }
    }

    const runTimer = async (phase: PomodoroPhase, minutes: number): Promise<boolean> => {
      const phaseLabel = getPhaseLabel(phase)
      const phaseEmoji = getPhaseEmoji(phase)
      const durationMs = minutes * 60 * 1000

      tui.output.newline()

      // Progress indicators
      const completedTomatoes = '🍅'.repeat(currentCycle - 1)
      const remainingTomatoes = '○'.repeat(cyclesBeforeLongBreak - currentCycle)
      tui.output.info(`${t('plugin:pomodoro.cycle', { current: currentCycle, total: cyclesBeforeLongBreak })} ${completedTomatoes}⏳${remainingTomatoes}`)

      const startTime = Date.now()
      const endTime = startTime + durationMs

      // Use spinner for countdown
      const spinner = tui.control.spinner({
        message: `${phaseEmoji}  ${phaseLabel}: ${formatTime(durationMs)}`,
      })

      spinner.start()

      // Countdown loop
      while (Date.now() < endTime) {
        const remaining = Math.max(0, endTime - Date.now())
        spinner.update(`${phaseEmoji} ${phaseLabel}: ${formatTime(remaining)}`)
        await tui.control.delay(1000)
      }

      spinner.succeed(`${phaseEmoji} ${phaseLabel} ${t('plugin:pomodoro.finished', { phase: '' })}`)

      // Play alarm sound
      await playAlarm()

      return true
    }

    // Main pomodoro loop
    while (!cancelled) {
      // Work phase
      const workCompleted = await runTimer('work', workMinutes)
      if (!workCompleted) {
        cancelled = true
        break
      }
      totalWorkMinutes += workMinutes

      // Break phase
      const isLongBreak = currentCycle >= cyclesBeforeLongBreak
      const breakPhase: PomodoroPhase = isLongBreak ? 'longBreak' : 'shortBreak'
      const breakDuration = isLongBreak ? longBreakMinutes : breakMinutes

      tui.output.newline()
      tui.output.success(t('plugin:pomodoro.finished', { phase: getPhaseLabel('work') }))

      // Ask to continue
      const continueSession = await tui.prompt.confirm(
        t('plugin:pomodoro.pressEnterToStart'),
        { defaultValue: true },
      )

      if (!continueSession) {
        cancelled = true
        break
      }

      await runTimer(breakPhase, breakDuration)

      // Update cycle
      if (isLongBreak) {
        currentCycle = 1

        // Ask if user wants another round
        tui.output.newline()
        tui.output.success(t('plugin:pomodoro.completed'))
        tui.output.info(t('plugin:pomodoro.totalWork', { time: formatMinutes(totalWorkMinutes) }))

        const anotherRound = await tui.prompt.confirm(
          'Start another pomodoro session?',
          { defaultValue: false },
        )

        if (!anotherRound) {
          break
        }
      } else {
        currentCycle++
      }
    }

    // Summary
    tui.output.newline()
    tui.output.separator()
    if (cancelled) {
      tui.output.warn(t('plugin:pomodoro.cancelled'))
    }
    tui.output.success(t('plugin:pomodoro.totalWork', { time: formatMinutes(totalWorkMinutes) }))
  },
})
