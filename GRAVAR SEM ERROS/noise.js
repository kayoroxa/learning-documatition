const noise = new Audio()
noise.src = 'inaudible-noise.wav'
noise.loop = true
noise.play()
//on click

document.onclick = () => {
  noise.play()
}

// bar.style.opacity = '0.3'

let bar

function changeColor() {
  const bar = document.querySelector('#bar')
  var hue = Math.floor(Math.random() * 360)
  console.log('changeColor', hue, bar)
  bar.style.backgroundColor = 'hsl(' + hue + ', 100%, 40%)'
}

export function Noise() {
  bar = document.createElement('div')
  bar.id = 'bar'
  document.body.appendChild(bar)
  // const bar = document.querySelector('#bar')
  bar.style.opacity = '0.3'
  bar.style.width = '100%'
  bar.style.position = 'fixed'
  bar.style.bottom = '0'
  bar.style.left = '0'
  bar.style.backgroundColor = 'blue'
  bar.style.height = '10px'

  return {
    next() {
      const bar = document.querySelector('#bar')

      noise.volume = 0
      bar.style.width = '0%'
      setTimeout(() => {
        noise.volume = 1
        noise.play()
        bar.style.width = '100%'
        bar.style.backgroundColor = 'blue'
      }, 1000)
    },
    prev() {
      const bar = document.querySelector('#bar')
      noise.volume = 0
      bar.style.width = '0%'
      setTimeout(() => {
        noise.volume = 1
        noise.play()
        bar.style.width = '100%'
        bar.style.backgroundColor = 'blue'
      }, 1000)
    },
    mistake() {
      const bar = document.querySelector('#bar')
      noise.volume = Math.max(0, noise.volume - noise.volume * 0.2)
      bar.style.width = noise.volume * 100 + '%'
      changeColor()
      noise.play()
    },
    disable() {
      noise.src = ''
    },
    enable() {
      noise.src = 'inaudible-noise.wav'
    },
  }
}
