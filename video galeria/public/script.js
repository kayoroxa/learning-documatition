import { debounce, createFolderButton, setActiveFolderButton, createVideoCard } from './utils/dom.js'
import { fetchVideos, fetchFolders } from './utils/api.js'
import { handleVideoAction } from './utils/video.js'
import { showNotification } from './utils/ui.js'
import { setupGlobalShortcuts } from './utils/events.js'


const videoCache = {}


function loadVideos(folder = 'ALL') {
  const gallery = document.getElementById('gallery')
  const loading = document.getElementById('galleryLoading')
  const error = document.getElementById('galleryError')

  gallery.innerHTML = ''
  error.classList.add('hidden')
  loading.classList.remove('hidden')

  // 👇 Verifica se a pasta está no cache
  if (videoCache[folder]) {
    renderVideos(videoCache[folder], folder)
    loading.classList.add('hidden')
    return
  }

  // 👇 Se não estiver no cache, faz fetch
  fetchVideos(folder)
    .then(videos => {
      videoCache[folder] = videos // salva no cache
      renderVideos(videos, folder)
      loading.classList.add('hidden')
    })
    .catch(err => {
      loading.classList.add('hidden')
      error.classList.remove('hidden')
      showNotification('Erro ao carregar vídeos', 'error')
    })
}

function renderVideos(videos, folder) {
  const gallery = document.getElementById('gallery')
  gallery.innerHTML = ''

  videos.slice(0, 12).forEach((video, index) => {
    const videoCard = createVideoCard(video, folder, index, (videoPath, startPercent, action) => {
      showNotification('Corte iniciado...', 'info')

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
}

function initApp() {
  const container = document.getElementById('folderButtons')
  const params = new URLSearchParams(window.location.search)
  const initialFolder = params.get('folder') || 'ALL'

  fetchFolders().then(folders => {
    folders.forEach(folder => {
      const btn = createFolderButton(folder, debounce((folderName, btnElement) => {
        loadVideos(folderName)
      
        const newUrl = `${window.location.pathname}?folder=${encodeURIComponent(folderName)}`
        window.history.pushState({ folder: folderName }, '', newUrl)
      
        setActiveFolderButton(folderName)
      }, 300))
      

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
  
  setupGlobalShortcuts(loadVideos, () => {
    const active = document.querySelector('#folderButtons .active-folder')
    return active?.textContent || 'ALL'
  })
  
}

document.addEventListener('DOMContentLoaded', initApp)
