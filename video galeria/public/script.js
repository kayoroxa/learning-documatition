document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gallery')
  const notificationsContainer = document.getElementById('notifications')

  function showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    notification.className = `notification ${type}`

    const emoji = document.createElement('span')
    emoji.className = 'emoji'

    if (type === 'success') {
      emoji.textContent = '🟢'
    } else if (type === 'error') {
      emoji.textContent = '🔴'
    } else {
      emoji.textContent = 'ℹ️'
    }

    const text = document.createElement('span')
    text.textContent = message

    notification.appendChild(emoji)
    notification.appendChild(text)
    notificationsContainer.appendChild(notification)

    setTimeout(() => {
      notificationsContainer.removeChild(notification)
    }, 5000)
  }

  function loadVideos(folder = 'ALL') {
    fetch(`/videos?folder=${encodeURIComponent(folder)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then(videos => {
        gallery.innerHTML = ''

        const displayedVideos = videos.slice(0, 12)

        displayedVideos.forEach(video => {
          const randomStartPercent = Math.random()
          const clipDuration = 10

          const videoCard = document.createElement('div')
          videoCard.className =
            'bg-gray-700 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 hover:shadow-xl transition duration-300 ease-in-out fade-blink'

          const videoElem = document.createElement('video')
          videoElem.src = `/stream?path=${encodeURIComponent(
            video
          )}&start=${randomStartPercent}&clipDuration=${clipDuration}`
          videoElem.className =
            'w-full h-60 rounded-lg object-cover cursor-pointer'
          videoElem.autoplay = true
          videoElem.loop = true
          videoElem.muted = true

          videoElem.addEventListener('loadeddata', () => {
            videoCard.classList.remove('fade-blink')
          })

          videoElem.addEventListener('contextmenu', event => {
            event.preventDefault()

            fetch(`/videos?folder=${encodeURIComponent(folder)}`)
              .then(response => response.json())
              .then(newVideos => {
                const newRandomVideo =
                  newVideos[Math.floor(Math.random() * newVideos.length)]
                const newStartPercent = Math.random()

                videoCard.classList.add('fade-blink')

                videoElem.src = `/stream?path=${encodeURIComponent(
                  newRandomVideo
                )}&start=${newStartPercent}&clipDuration=${clipDuration}`
              })
              .catch(error => {
                console.error('Erro ao buscar novo vídeo:', error)
              })
          })

          videoElem.addEventListener('mousedown', event => {
            const isMiddleClick = event.button === 1
            const isLeftClick = event.button === 0

            if (isLeftClick || isMiddleClick) {
              showNotification('Iniciando corte do vídeo...', 'info')

              const action = isLeftClick ? 'save' : 'open'
              fetch(
                `/cut?path=${encodeURIComponent(
                  video
                )}&start=${randomStartPercent}&clipDuration=10&action=${action}`,
                {
                  method: 'POST',
                }
              )
                .then(response => {
                  if (!response.ok) {
                    return response.json().then(data => {
                      throw new Error(data.message || 'Erro desconhecido')
                    })
                  }
                  return response.json()
                })
                .then(data => {
                  showNotification(data.message, 'success')
                  console.log('Arquivo gerado:', data.outputFilePath)
                  console.log('Proxy gerado:', data.proxyFilePath)
                })
                .catch(error => {
                  console.error('Erro no processo:', error.message)
                  showNotification(error.message, 'error')
                })
            }
          })

          videoCard.appendChild(videoElem)
          gallery.appendChild(videoCard)
        })
      })
      .catch(error => {
        console.error('Error fetching videos:', error)
      })
  }

  // Carrega botões de pasta dinamicamente
  fetch('/folders')
    .then(res => res.json())
    .then(folders => {
      const container = document.getElementById('folderButtons')
      folders.forEach(folder => {
        const btn = document.createElement('button')
        btn.textContent = folder
        btn.className =
          'bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded'
        btn.onclick = () => loadVideos(folder)
        container.appendChild(btn)
      })
    })

  // Carrega os vídeos iniciais (ALL)
  loadVideos()
})
