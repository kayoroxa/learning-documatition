const chalk = require('chalk')

const typeEmoji = {
  log: '🟢',
  info: '🔵',
  warn: '🟡',
  error: '🔴',
  group: '📦',
  groupCollapsed: '📦',
  end: '🔚',
}

const labelEmoji = {
  preview: '🎬',
  cut: '✂️',
  codec: '🎧',
  warmup: '🔥',
  folders: '📁',
  videos: '🎞️',
  lock: '🔒',
  smart: '🧠',
  cache: '🧊',
  durationCache: '⏱️',
  reload: '🔁',
  diagnostic: '🧪',
  bind: '🧷',
  shortcut: '⌨️',
  url: '🌐',
  autoplay: '▶️',
  slots: '🎨',
  scene: '🎭',
  default: '💬',
}

function log(label, data = null, type = 'log') {
  const emoji = labelEmoji[label] || typeEmoji[type] || labelEmoji.default
  const prefix = `${emoji} [${label}]`

  switch (type) {
    case 'group':
      console.group(chalk.cyan(prefix))
      break
    case 'groupCollapsed':
      console.groupCollapsed(chalk.cyan(prefix))
      break
    case 'end':
      console.groupEnd()
      break
    case 'warn':
      data !== null
        ? console.warn(chalk.yellow(prefix), data)
        : console.warn(chalk.yellow(prefix))
      break
    case 'error':
      data !== null
        ? console.error(chalk.red(prefix), data)
        : console.error(chalk.red(prefix))
      break
    case 'info':
      data !== null
        ? console.info(chalk.blue(prefix), data)
        : console.info(chalk.blue(prefix))
      break
    default:
      data !== null
        ? console.log(chalk.green(prefix), data)
        : console.log(chalk.green(prefix))
  }
}

module.exports = { log }
