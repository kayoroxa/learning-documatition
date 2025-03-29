import {
  createFolderButton,
  setActiveFolderButton,
  createVideoCard
} from './utils/dom.js'

import { fetchVideos, fetchFolders } from './utils/api.js'
import { handleVideoAction } from './utils/video.js'
import { showNotification } from './utils/ui.js'


function loadVideos(folder = 'ALL') {
  const gallery = document.getElementById('gallery')

  fetchVideos(folder)
    .then(videos => {
      gallery.innerHTML = ''
      videos.slice(0, 12).forEach((video, index) => {
        const videoCard = createVideoCard(video, folder, index, (videoPath, startPercent, action) => {
          showNotification('Corte iniciado...', 'info') // 👈 imediato

          handleVideoAction(videoPath, startPercent, action)
            .then(data => {
              const isAlready = data.message.toLowerCase().includes('already')
              const type = isAlready ? 'info' : 'success'
              showNotification(data.message, type)
            })
            .catch(error => showNotification(error.message || 'Erro ao cortar', 'error'))
          
          
        })

        gallery.appendChild(videoCard)
      })
    })
    .catch(err => {
      showNotification('Erro ao carregar vídeos', 'error')
    })
}

function initApp() {
  const container = document.getElementById('folderButtons')
  const params = new URLSearchParams(window.location.search)
  const initialFolder = params.get('folder') || 'ALL'

  fetchFolders().then(folders => {
    folders.forEach(folder => {
      const btn = createFolderButton(folder, (folderName, btnElement) => {
        loadVideos(folderName)

        const newUrl = `${window.location.pathname}?folder=${encodeURIComponent(folderName)}`
        window.history.pushState({ folder: folderName }, '', newUrl)

        setActiveFolderButton(folderName)
      })

      container.appendChild(btn)
    })

    setActiveFolderButton(initialFolder)
    loadVideos(initialFolder)
  })

  window.onpopstate = (event) => {
    const folder = (event.state && event.state.folder) || 'ALL'
    loadVideos(folder)
    setActiveFolderButton(folder)
  }
}

document.addEventListener('DOMContentLoaded', initApp)
