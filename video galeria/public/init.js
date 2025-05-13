import { loadVideos } from './video.js'
import { showNotification } from './utils/ui.js'
import { setupGlobalShortcuts, bindRightClickReload, bindMouseClicks } from './utils/events.js'
import { ROOT_FOLDER_KEY, FOLDER_QUERY_PARAM } from './utils/constants.js'
import { createFolderButtons } from './utils/folders.js'
import { logStep } from './utils/logger.js'

document.addEventListener('DOMContentLoaded', () => {
  // 🔎 Extrai slug da URL (ex: youtube-videos)
  const params = new URLSearchParams(location.search)
  const slug = params.get(FOLDER_QUERY_PARAM) || ROOT_FOLDER_KEY

  // 🧠 Passa o slug direto para a função de criação
  createFolderButtons(loadVideos, slug, (resolvedFolderName) => {
    document.body.dataset.currentFolder = resolvedFolderName

    logStep('init', `🚀 Iniciando aplicação com pasta: ${resolvedFolderName}`, 'info')

    loadVideos(resolvedFolderName)
    setupGlobalShortcuts(loadVideos, () => document.body.dataset.currentFolder)
    bindRightClickReload()
    bindMouseClicks()
    showNotification('Galeria iniciada com sucesso', 'info', true)
  })
})
