/**
 * arere-plugin-timer
 *
 * Timer utilities for productivity
 * - timer: Countdown timer
 * - pomodoro: Pomodoro technique timer
 */

import { definePlugin } from 'arere'

export default definePlugin({
  meta: {
    name: 'arere-plugin-timer',
    description: 'Timer plugin - countdown, pomodoro',
    author: 'arere team',
    i18nNamespace: 'plugin-timer',
  },
  actions: ['actions/timer.ts', 'actions/pomodoro.ts'],
  locales: 'locales',
})
