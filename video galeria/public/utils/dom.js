import { buildVideoUrl } from './api.js'
import { loadWithRetryOrReplace } from './video.js'

export function createVideoCard(video, folder, index, onClickAction) {
  const videoCard = document.createElement('div')
  videoCard.className =
    'bg-gray-700 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 hover:shadow-xl transition duration-300 ease-in-out fade-blink'

  const videoElem = document.createElement('video')
  const randomStartPercent = Math.random() * 0.9 // garantir sempre um espaço de 10s antes do fim.
  const clipDuration = 10

  videoElem.className = 'w-full h-60 rounded-lg object-cover cursor-pointer'
  videoElem.muted = true
  videoElem.autoplay = true
  videoElem.loop = true
  videoElem.controls = false
  videoElem.setAttribute('playsinline', '')
  videoElem.setAttribute('preload', 'none')
  videoElem.setAttribute('type', 'video/mp4')

  videoElem.addEventListener('loadeddata', () => {
    videoCard.classList.remove('fade-blink')
    videoElem.currentTime = 0.01
  })

  videoElem.addEventListener('error', e => {
    const err = e.target?.error
    console.error('⚠️ Erro de carregamento do vídeo:', err?.code, err)
  })

  videoElem.addEventListener('mousedown', event => {
    const isMiddleClick = event.button === 1
    const isLeftClick = event.button === 0
    const action = isLeftClick ? 'save' : isMiddleClick ? 'open' : null
    if (!action) return

    onClickAction(video, randomStartPercent, action)
  })

  videoCard.appendChild(videoElem)

  // Aplica o carregamento do vídeo depois de um delay
  setTimeout(() => {
    const videoUrl = buildVideoUrl(video, randomStartPercent, clipDuration)
    loadWithRetryOrReplace(videoElem, videoUrl, folder, clipDuration)
  }, index * 250)

  return videoCard
}

export function createFolderButton(folder, onClick) {
  const btn = document.createElement('button')
  btn.textContent = folder
  btn.className = 'bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded'
  btn.addEventListener('click', () => onClick(folder, btn))
  return btn
}

export function setActiveFolderButton(folderName) {
  const allButtons = document.querySelectorAll('#folderButtons button')
  allButtons.forEach(btn => {
    if (btn.textContent === folderName) {
      btn.classList.add('active-folder')
    } else {
      btn.classList.remove('active-folder')
    }
  })
}
