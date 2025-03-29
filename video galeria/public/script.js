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

  function loadWithRetryOrReplace(videoElem, videoUrl, folder, clipDuration = 10, attemptsLeft = 3, delay = 1000) {
    videoElem.src = videoUrl
    videoElem.load()
  
    const onError = () => {
      if (attemptsLeft > 0) {
        console.warn(`🔁 Tentando recarregar vídeo... tentativas restantes: ${attemptsLeft - 1}`)
        setTimeout(() => {
          loadWithRetryOrReplace(videoElem, videoUrl, folder, clipDuration, attemptsLeft - 1, delay)
        }, delay)
      } else {
        console.warn('❌ Falha ao carregar vídeo após todas as tentativas. Buscando novo vídeo...')
  
        fetch(`/videos?folder=${encodeURIComponent(folder)}`)
          .then(response => response.json())
          .then(newVideos => {
            const newRandomVideo = newVideos[Math.floor(Math.random() * newVideos.length)]
            const newStartPercent = Math.random()
  
            const newVideoUrl = `/stream?path=${encodeURIComponent(newRandomVideo)}&start=${newStartPercent}&clipDuration=${clipDuration}&t=${Date.now()}`
            loadWithRetryOrReplace(videoElem, newVideoUrl, folder, clipDuration)
          })
          .catch(err => {
            console.error('⚠️ Erro ao buscar vídeo de fallback:', err)
          })
      }
    }
  
    videoElem.onerror = onError
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

        displayedVideos.forEach((video, index) => {
          const randomStartPercent = Math.random()
          const clipDuration = 10
        
          const videoCard = document.createElement('div')
          videoCard.className =
            'bg-gray-700 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 hover:shadow-xl transition duration-300 ease-in-out fade-blink'
        
          const videoElem = document.createElement('video')
          let isLoading = true
        
          videoElem.className = 'w-full h-60 rounded-lg object-cover cursor-pointer'
          videoElem.muted = true
          videoElem.autoplay = true
          videoElem.loop = true
          videoElem.controls = false
          videoElem.setAttribute('playsinline', '')
          videoElem.setAttribute('preload', 'none')
          videoElem.setAttribute('type', 'video/mp4')
        
          
        
          // Log de erro (debug)
          videoElem.addEventListener('error', e => {
            const err = e.target?.error
            console.error('⚠️ Erro de carregamento do vídeo:', err?.code, err)
          })
        
          // Quando carregar, remove efeitos visuais
          videoElem.addEventListener('loadeddata', () => {
            isLoading = false
            videoCard.classList.remove('fade-blink')
            videoElem.removeAttribute('poster')
            videoElem.currentTime = 0.01 // Hack pra evitar bug em alguns browsers
          })
        
          // Clique direito: trocar vídeo
          videoElem.addEventListener('contextmenu', event => {
            event.preventDefault()
            if (isLoading) return
        
            isLoading = true
            videoCard.classList.add('fade-blink')
        
            fetch(`/videos?folder=${encodeURIComponent(folder)}`)
              .then(response => response.json())
              .then(newVideos => {
                const newRandomVideo = newVideos[Math.floor(Math.random() * newVideos.length)]
                const newStartPercent = Math.random()
        
                const newUrl = `/stream?path=${encodeURIComponent(newRandomVideo)}&start=${newStartPercent}&clipDuration=${clipDuration}&t=${Date.now()}`
                loadWithRetryOrReplace(videoElem, newUrl, folder, clipDuration)
              })
              .catch(error => {
                console.error('Erro ao buscar novo vídeo:', error)
              })
          })
        
          // Clique: cortar
          videoElem.addEventListener('mousedown', event => {
            const isMiddleClick = event.button === 1
            const isLeftClick = event.button === 0
        
            if (isLeftClick || isMiddleClick) {
              showNotification('Iniciando corte do vídeo...', 'info')
        
              const action = isLeftClick ? 'save' : 'open'
              fetch(
                `/cut?path=${encodeURIComponent(video)}&start=${randomStartPercent}&clipDuration=10&action=${action}`,
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
        
          // Delay progressivo para evitar carregamento simultâneo pesado
          const delay = index * 250 // 250ms entre cada
          setTimeout(() => {
            const videoUrl = `/stream?path=${encodeURIComponent(video)}&start=${randomStartPercent}&clipDuration=${clipDuration}&t=${Date.now()}`
            loadWithRetryOrReplace(videoElem, videoUrl, folder, clipDuration)
          }, delay)
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
          btn.onclick = () => {
            loadVideos(folder)
          
            // Atualiza URL
            const newUrl = `${window.location.pathname}?folder=${encodeURIComponent(folder)}`
            window.history.pushState({ folder }, '', newUrl)
          
            // Atualiza o estado visual dos botões
            document.querySelectorAll('#folderButtons button').forEach(b => {
              b.classList.remove('active-folder')
            })
            btn.classList.add('active-folder')
          }
          
          
        container.appendChild(btn)
      })
      // Marca o botão ativo com base na URL (após os botões serem criados)
const params = new URLSearchParams(window.location.search)
const activeFolder = params.get('folder') || 'ALL'
const activeBtn = Array.from(container.querySelectorAll('button'))
  .find(b => b.textContent === activeFolder)

if (activeBtn) activeBtn.classList.add('active-folder')

    })

  // Detecta pasta da URL ou carrega ALL
const params = new URLSearchParams(window.location.search)
const initialFolder = params.get('folder') || 'ALL'
loadVideos(initialFolder)

// Marca o botão como ativo visualmente
setTimeout(() => {
  const activeBtn = Array.from(document.querySelectorAll('#folderButtons button'))
    .find(b => b.textContent === initialFolder)
  if (activeBtn) activeBtn.classList.add('active-folder')
}, 100) // pequeno delay pra garantir que os botões já foram renderizados


// Suporte ao botão "voltar" do navegador
window.onpopstate = (event) => {
  const folder = (event.state && event.state.folder) || 'ALL'
  loadVideos(folder)
}

})
