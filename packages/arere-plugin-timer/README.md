# arere-plugin-timer

> Timer utilities for productivity

[Japanese](./README.ja.md) | English

## Overview

This plugin provides timer-related actions for the arere terminal launcher. Focus on your work with countdown timers and the Pomodoro technique.

## Features

- **timer**: Simple countdown timer with customizable duration
- **pomodoro**: Pomodoro technique timer with work/break cycles
- **Sound notifications**: Alarm sound when timer completes
- **i18n support**: English and Japanese

## Installation

```bash
npm install arere-plugin-timer
```

## Configuration

Add to your `.arere/settings.json`:

```json
{
  "plugins": {
    "arere-plugin-timer": true
  }
}
```

## Actions

### timer

Simple countdown timer with notification.

**Features**:
- Flexible duration input: `5m`, `30s`, `1h`, `1h30m`, `90s`
- Real-time countdown display
- Alarm sound on completion

**Usage**:
1. Select "timer" from action list
2. Enter duration (e.g., `25m` for 25 minutes)
3. Timer starts with countdown display
4. Alarm plays when complete

### pomodoro

Pomodoro technique timer for focused work sessions.

**Default Settings**:
- Work time: 25 minutes
- Short break: 5 minutes
- Long break: 15 minutes
- Cycles before long break: 4

**Features**:
- Customizable durations
- Visual cycle progress indicator
- Automatic work/break transitions
- Session summary with total work time
- Sound notifications between phases

**Usage**:
1. Select "pomodoro" from action list
2. Configure durations (or use defaults)
3. Work through cycles
4. Take breaks when prompted
5. View session summary at end

## Project Structure

```
arere-plugin-timer/
├── src/
│   ├── index.ts          # Plugin definition
│   └── playSound.ts      # Sound playback utility
├── actions/
│   ├── timer.ts          # Countdown timer action
│   └── pomodoro.ts       # Pomodoro timer action
├── locales/
│   ├── en/translation.json
│   └── ja/translation.json
├── sounds/
│   └── alarm.wav         # Notification sound
└── README.md
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev
```

## License

MIT
