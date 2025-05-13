export function showNotification(message, type = 'info', useTypeEmoji = false) {
  let container = document.getElementById('notifications')
  
  if (!container) {
    container = document.createElement('div')
    container.id = 'notifications'
    container.className = 'notification-container'
    document.body.appendChild(container)
  }

  const notif = document.createElement('div')
  notif.className = `notification ${type} fade-in`

  const emoji = useTypeEmoji ? `<span class="emoji">${getEmoji(type)}</span>` : ''
  notif.innerHTML = `${emoji}<span>${message}</span>`

  container.appendChild(notif)

  setTimeout(() => {
    notif.classList.remove('fade-in')
    notif.classList.add('fade-out')
  }, 4500)

  setTimeout(() => {
    if (notif.parentNode) notif.parentNode.removeChild(notif)
  }, 5000)
}

function getEmoji(type) {
  switch (type) {
    case 'success': return '✅'
    case 'error': return '❌'
    case 'info': return 'ℹ️'
    case 'warn': return '⚠️'
    default: return '🔔'
  }
}
