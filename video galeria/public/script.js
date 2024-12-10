document.addEventListener('DOMContentLoaded', () => {
  fetch('/videos')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then(videos => {
      const gallery = document.getElementById('gallery')
      gallery.innerHTML = '' // Limpar o conteúdo existente

      // Garantir que apenas 12 vídeos sejam exibidos
      const displayedVideos = videos.slice(0, 12)

      displayedVideos.forEach(video => {
        const randomStartPercent = Math.random() // Random percentage for start time
        const clipDuration = 10 // Duration of the clip in seconds

        // Cria o contêiner do vídeo com a animação inicial
        const videoCard = document.createElement('div')
        videoCard.className =
          'bg-gray-700 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 hover:shadow-xl transition duration-300 ease-in-out fade-blink'

        // Cria o elemento do vídeo
        const videoElem = document.createElement('video')
        videoElem.src = `/stream?path=${encodeURIComponent(
          video
        )}&start=${randomStartPercent}&clipDuration=${clipDuration}`
        videoElem.className =
          'w-full h-60 rounded-lg object-cover cursor-pointer' // Adicionado cursor-pointer
        videoElem.autoplay = true
        videoElem.loop = true
        videoElem.muted = true

        // Configura a fonte do vídeo
        videoElem.src = `/stream?path=${encodeURIComponent(
          video
        )}&start=${randomStartPercent}&clipDuration=${clipDuration}`

        // Evento para remover o efeito de fade após carregar o vídeo
        videoElem.addEventListener('loadeddata', () => {
          videoCard.classList.remove('fade-blink')
        })

        // Função para criar notificações
        function showNotification(message, type = 'info') {
          const notificationsContainer =
            document.getElementById('notifications')
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

        // Evento para clique direito
        videoElem.addEventListener('contextmenu', event => {
          event.preventDefault()

          fetch('/videos')
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok')
              }
              return response.json()
            })
            .then(newVideos => {
              const newRandomVideo =
                newVideos[Math.floor(Math.random() * newVideos.length)]
              const newStartPercent = Math.random()

              videoCard.classList.add('fade-blink') // Adiciona efeito de fade enquanto carrega

              videoElem.src = `/stream?path=${encodeURIComponent(
                newRandomVideo
              )}&start=${newStartPercent}&clipDuration=${clipDuration}`
            })
            .catch(error => {
              console.error('Erro ao buscar novo vídeo:', error)
            })
        })

        // Evento de clique para manipular o corte
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
})
