export function logStep(label, data = null, type = 'log') {
  const emojiMap = {
    log: '🟢',
    warn: '🟡',
    error: '🔴',
    info: '🔵',
    group: '📦',
    groupCollapsed: '📦',
  }

  const emoji = emojiMap[type] || '🟢'

  if (type === 'group') {
    console.group(`${emoji} [${label}]`)
    return
  }

  if (type === 'groupCollapsed') {
    console.groupCollapsed(`${emoji} [${label}]`)
    return
  }

  if (type === 'end') {
    console.groupEnd()
    return
  }

  if (data !== null) {
    console[type](`${emoji} [${label}]`, data)
  } else {
    console[type](`${emoji} [${label}]`)
  }
}
