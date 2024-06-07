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

      videos.forEach(video => {
        const videoElem = document.createElement('video')
        videoElem.src = `/stream?path=${encodeURIComponent(
          video
        )}&start=0&end=10`
        videoElem.className = 'video-thumbnail'
        videoElem.autoplay = true
        videoElem.loop = true
        videoElem.muted = true
        videoElem.controls = true

        videoElem.addEventListener('click', () => {
          const start = 0 // Define o ponto inicial do corte
          const end = 10 // Define o ponto final do corte

          fetch(
            `/cut?path=${encodeURIComponent(video)}&start=${start}&end=${end}`,
            {
              method: 'POST',
            }
          )
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok')
              }
              return response.json()
            })
            .then(data => {
              console.log(data.message)
            })
            .catch(error => {
              console.error('Error cutting video:', error)
            })
        })

        gallery.appendChild(videoElem)
      })
    })
    .catch(error => {
      console.error('Error fetching videos:', error)
    })
})
