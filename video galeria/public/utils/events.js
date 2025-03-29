export function setupGlobalShortcuts(loadVideos, getCurrentFolder) {
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase()

    // Exemplo: R = recarregar pasta atual
    if (key === 'r') {
      const folder = getCurrentFolder()
      if (folder) {
        loadVideos(folder)
      }
    }

    // Exemplo: 1-9 = pular para pastas por índice (futuro)
    if (!isNaN(key) && Number(key) >= 1 && Number(key) <= 9) {
      const buttons = document.querySelectorAll('#folderButtons button')
      const index = Number(key) - 1
      if (buttons[index]) {
        buttons[index].click()
      }
    }

    // Futuro: espaço pra toggle mute, ESC pra limpar seleção, etc
  })
}
