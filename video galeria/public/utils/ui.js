export function showNotification(message, type = 'info') {
  const container = document.getElementById('notifications')
  if (!container) return

  const notif = document.createElement('div')
  notif.className = `notification ${type}`
  notif.innerHTML = `
    <span class="emoji">${getEmoji(type)}</span>
    <span>${message}</span>
  `

  container.appendChild(notif)

  setTimeout(() => {
    container.removeChild(notif)
  }, 5000)
}

function getEmoji(type) {
  switch (type) {
    case 'success': return '✅'
    case 'error': return '❌'
    case 'info': return 'ℹ️'
    default: return '🔔'
  }
}
