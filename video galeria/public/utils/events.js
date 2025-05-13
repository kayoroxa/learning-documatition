import { reloadVideoWithNewStart, handleVideoAction } from '../video.js'
import { showNotification } from './ui.js'
import { logStep } from './logger.js'

export function setupGlobalShortcuts(loadVideos, getCurrentFolder) {
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase()

    // 🔁 Tecla R → recarregar pasta atual
    if (key === 'r') {
      const folder = getCurrentFolder()
      if (folder) {
        logStep('shortcut', `🔁 Recarregando pasta atual: ${folder}`, 'info')
        loadVideos(folder)
      }
    }

    // 1–9 → clicar em botões de pasta (atalho futuro)
    if (!isNaN(key) && Number(key) >= 1 && Number(key) <= 9) {
      const buttons = document.querySelectorAll('#folderButtons button')
      const index = Number(key) - 1
      if (buttons[index]) {
        logStep('shortcut', `📂 Pulando para pasta via botão ${key}`, 'info')
        buttons[index].click()
      }
    }

    // (futuro) espaço, esc etc...
  })
}

export function bindRightClickReload() {
  const gallery = document.querySelector('#gallery')

  gallery.addEventListener('contextmenu', (e) => {
    const videoElem = e.target.closest('video')
    if (!videoElem) return

    e.preventDefault()

    const slot = videoElem.closest('.video-card')
    const videoCards = Array.from(gallery.querySelectorAll('.video-card'))
    const index = videoCards.indexOf(slot)
    if (index === -1) {
      logStep('rightClick', '⚠️ Slot não encontrado na lista de video-cards', 'warn')
      return
    }

    const folder = document.body.dataset.currentFolder
    if (index < 0 || !folder) return

    const videoData = JSON.parse(videoElem.dataset.meta || '{}')

    if (!videoData || !videoData.original) {
      logStep('rightClick', '⚠️ Sem metadados para vídeo', 'warn')
      return
    }

    logStep('rightClick', `🖱️ Recarregando preview com nova cena: ${videoData.original}`, 'info')
    reloadVideoWithNewStart(videoElem, videoData)
  })
}

export function bindMouseClicks() {
  const gallery = document.querySelector('#gallery')

  gallery.addEventListener('mousedown', async (e) => {
    const card = e.target.closest('.slot')
    if (!card || !card.dataset.meta) return

    const video = JSON.parse(card.dataset.meta)

    // Botão esquerdo → apenas cortar
    if (e.button === 0) {
      showNotification('✂️ Cortando trecho...')
      try {
        const result = await handleVideoAction(video.original, video.start)

        if (result?.message?.includes('já existe')) {
          showNotification('⚠️ Corte já existia')
        } else {
          showNotification('✅ Corte salvo com sucesso!')
        }
      } catch (err) {
        logStep('cut', `❌ Erro ao cortar: ${err.message}`, 'error')
        showNotification('❌ Erro ao cortar vídeo')
      }
    }

    // Botão do meio → cortar + abrir no Explorer
    if (e.button === 1) {
      e.preventDefault()
      showNotification('📂 Abrindo pasta no Explorer...')
      try {
        const result = await handleVideoAction(video.original, video.start)

        if (result?.message?.includes('já existe')) {
          showNotification('⚠️ Corte já existia')
        } else {
          showNotification('✅ Corte salvo com sucesso!')
        }

        await fetch(`/open-explorer?path=${encodeURIComponent(video.original)}`)
        showNotification('✅ Explorer aberto!')
      } catch (err) {
        logStep('cut+explorer', `❌ Erro: ${err.message}`, 'error')
        showNotification('❌ Erro ao cortar e abrir pasta')
      }
    }
  })
}
