/**
 * Tutorial 10: Timing Control
 *
 * Related docs: docs/content/ja/1.guides/8.prompt-vs-control-api.md
 *
 * What you'll learn:
 * - Pause with tui.control.delay()
 * - Wait for Enter key with tui.control.waitForEnter()
 * - Wait for specific key with tui.control.waitForKey()
 * - Detect environment with tui.control.isInteractive()
 * - Get terminal size with tui.control.getTerminalSize()
 */

import { defineAction } from 'arere'

const translations = {
  en: {
    description: 'Timing Control APIs',
    title: 'Timing Control Tutorial',
    intro: 'Learn how to control timing and detect environment.',
    section_delay: 'Delay',
    section_wait_enter: 'Wait for Enter',
    section_wait_key: 'Wait for Key',
    section_environment: 'Environment Detection',
    waiting: 'Waiting 1 second...',
    done_waiting: 'Done waiting!',
    press_enter: 'Press Enter to continue...',
    enter_pressed: 'Enter was pressed!',
    press_yn: 'Press Y or N:',
    completed: 'Timing control tutorial completed!',
    next_step: 'Next: Try "12-headless-mode" to learn CI/CD compatibility',
    pressed_yes: 'You pressed Y (Yes)',
    pressed_no: 'You pressed N (No)',
    skip_interactive: 'Skipping interactive steps (not in interactive mode)',
    code_wait_1sec: 'Wait 1 second',
  },
  ja: {
    description: 'タイミング制御 API',
    title: 'タイミング制御チュートリアル',
    intro: 'タイミング制御と環境検出の方法を学びます。',
    section_delay: '遅延',
    section_wait_enter: 'Enter キー待機',
    section_wait_key: '特定キー待機',
    section_environment: '環境検出',
    waiting: '1秒待機中...',
    done_waiting: '待機完了！',
    press_enter: 'Enter キーを押して続行...',
    enter_pressed: 'Enter が押されました！',
    press_yn: 'Y または N を押してください:',
    completed: 'タイミング制御チュートリアル完了！',
    next_step: '次へ: "12-headless-mode" で CI/CD 対応を学びましょう',
    pressed_yes: 'Y（はい）が押されました',
    pressed_no: 'N（いいえ）が押されました',
    skip_interactive: 'インタラクティブステップをスキップ（インタラクティブモードではありません）',
    code_wait_1sec: '1秒待機',
  },
}

export default defineAction({
  description: ({ t }) => t('description'),
  category: 'tutorial',
  tags: ['timing', 'delay'],
  translations,
  run: async ({ tui, t }) => {
    tui.output.section(t('title'))
    tui.output.info(t('intro'))
    tui.output.newline()

    // 1. Environment detection (shown first)
    tui.output.step(1, t('section_environment'))
    tui.output.code(`const isInteractive = tui.control.isInteractive()
const { width, height } = tui.control.getTerminalSize()`)

    const isInteractive = tui.control.isInteractive()
    const size = tui.control.getTerminalSize()

    tui.output.keyValue({
      'Interactive Mode': isInteractive ? 'Yes' : 'No (Headless)',
      'Terminal Width': `${size.width} columns`,
      'Terminal Height': `${size.height} rows`,
    })
    tui.output.newline()

    // 2. Delay
    tui.output.step(2, t('section_delay'))
    tui.output.code(`await tui.control.delay(1000)  // ${t('code_wait_1sec')}`)

    tui.output.info(t('waiting'))
    await tui.control.delay(1000)
    tui.output.success(t('done_waiting'))
    tui.output.newline()

    // Wait for key input only in interactive mode
    if (isInteractive) {
      // 3. Wait for Enter key
      tui.output.step(3, t('section_wait_enter'))
      tui.output.code(`await tui.control.waitForEnter('Press Enter...')`)

      await tui.control.waitForEnter(t('press_enter'))
      tui.output.success(t('enter_pressed'))
      tui.output.newline()

      // 4. Wait for specific key
      tui.output.step(4, t('section_wait_key'))
      tui.output.code(`const key = await tui.control.waitForKey({
  keys: ['y', 'n'],
  caseInsensitive: true
})`)

      tui.output.info(t('press_yn'))
      const key = await tui.control.waitForKey({
        keys: ['y', 'n'],
        caseInsensitive: true,
      })

      if (key.toLowerCase() === 'y') {
        tui.output.success(t('pressed_yes'))
      } else {
        tui.output.info(t('pressed_no'))
      }
      tui.output.newline()
    } else {
      tui.output.warn(t('skip_interactive'))
      tui.output.newline()
    }

    tui.output.separator()
    tui.output.success(t('completed'))
    tui.output.info(t('next_step'))
  },
})
