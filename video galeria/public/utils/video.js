import { fetchVideos, buildVideoUrl } from './api.js'
import { showNotification } from './ui.js'

export function loadWithRetryOrReplace(videoElem, videoUrl, folder, clipDuration = 10, attemptsLeft = 3, delay = 1000) {
  videoElem.src = videoUrl
  videoElem.load()

  videoElem.onerror = () => {
    if (attemptsLeft > 0) {
      setTimeout(() => {
        loadWithRetryOrReplace(videoElem, videoUrl, folder, clipDuration, attemptsLeft - 1, delay)
      }, delay)
    } else {
      fetchVideos(folder).then(newVideos => {
        const newRandom = newVideos[Math.floor(Math.random() * newVideos.length)]
        const start = Math.random()
        const newUrl = buildVideoUrl(newRandom, start, clipDuration)
        loadWithRetryOrReplace(videoElem, newUrl, folder, clipDuration)
      })
    }
  }
}

export function handleVideoAction(videoPath, startPercent, action) {

  return fetch(`/cut?path=${encodeURIComponent(videoPath)}&start=${startPercent}&clipDuration=10&action=${action}`, {
    method: 'POST',
  })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => {
          throw new Error(data.message || 'Erro ao cortar vídeo')
        })
      }
      return res.json()
    })
}