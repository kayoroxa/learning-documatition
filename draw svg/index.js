const svgPath = document.querySelectorAll('path')

const handAlongPath = document.querySelector('.hand')

var tl = anime.timeline({
  easing: 'linear',
  duration: 30000,
})

handAlongPath.style.transform = `translate(1000px, 1000px)`

svgPath.forEach(path => {
  tl.add(
    {
      targets: path,
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInOutSine',
      // duration: 1000,
      delay: anime.stagger(100),

      change: function (anim) {
        // hand along path
        const path = anim.animations[0].animatable.target
        if (!path) return
        const { x, y } = path.getPointAtLength(
          (anim.progress / 100) * path.getTotalLength()
        )
        handAlongPath.style.transform = `translate(${x + 280}px, ${y - 163}px)`
      },
    },
    '+=10'
  )
})
