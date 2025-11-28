/**
 * Sound playback utility for timer plugin
 */

import { exec } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Check if running in WSL
 */
function isWSL(): boolean {
  try {
    const release = require('node:os').release().toLowerCase()
    return release.includes('microsoft') || release.includes('wsl')
  } catch {
    return false
  }
}

/**
 * Convert WSL path to Windows path
 */
function toWindowsPath(linuxPath: string): string {
  // /home/user/... -> \\wsl$\Ubuntu\home\user\...
  // or use wslpath command
  return linuxPath.replace(/\//g, '\\')
}

/**
 * Play the alarm sound
 *
 * @returns Promise that resolves when sound starts playing (not when finished)
 */
export function playAlarm(): Promise<void> {
  return new Promise((resolve) => {
    const soundPath = path.join(__dirname, '../sounds/alarm.wav')

    if (isWSL()) {
      // Use PowerShell SoundPlayer for WAV on Windows from WSL
      const cmd = `powershell.exe -c "(New-Object Media.SoundPlayer '$(wslpath -w '${soundPath}')').PlaySync()"`
      exec(cmd, (err) => {
        if (err) {
          // Fallback to terminal bell
          process.stdout.write('\x07')
        }
      })
    } else {
      // Use play-sound for native Linux/Mac
      import('play-sound')
        .then(({ default: player }) => {
          const audio = player()
          audio.play(soundPath, (err) => {
            if (err) {
              process.stdout.write('\x07')
            }
          })
        })
        .catch(() => {
          process.stdout.write('\x07')
        })
    }

    resolve()
  })
}
