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
        // Define a porcentagem de início e a duração do clipe
        const randomStartPercent = Math.random() // Random percentage for start time
        const clipDuration = 10 // Duration of the clip in seconds

        const videoElem = document.createElement('video')
        videoElem.src = `/stream?path=${encodeURIComponent(
          video
        )}&start=${randomStartPercent}&clipDuration=${clipDuration}`
        videoElem.className = 'video-thumbnail'
        videoElem.autoplay = true
        videoElem.loop = true
        videoElem.muted = true
        // videoElem.controls = true

        videoElem.addEventListener('click', () => {
          console.log('oi')

          fetch(
            `/cut?path=${encodeURIComponent(
              video
            )}&start=${randomStartPercent}&clipDuration=10`,
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

        const container = document.createElement('div')
        container.appendChild(videoElem)

        gallery.appendChild(container)
      })
    })
    .catch(error => {
      console.error('Error fetching videos:', error)
    })
})
