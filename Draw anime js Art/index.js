anime({
  targets: '.verde',
  left: '300px',
  backgroundColor: 'rgb(9, 255, 0)',
  borderRadius: ['0%', '100%'],
  easing: 'easeInOutQuad',
  duration: 1000,
  opacity: [0, 1],
})

//------//

var textWrapper = document.querySelector('.title .text')
textWrapper.innerHTML = textWrapper.textContent.replace(
  /\S/g,
  "<span class='letter'>$&</span>"
)

anime
  .timeline({ loop: true }) // -- criou um pai só pra rodar o timeline e por loop
  .add({
    targets: '.title .line',
    scaleY: [0, 1],
    opacity: [0.5, 1],
    easing: 'easeOutExpo',
    duration: 700,
  })
  .add({
    targets: '.title .line',
    translateX: [
      0,
      document.querySelector('.title .text').getBoundingClientRect().width + 10,
    ],
    easing: 'easeOutExpo',
    duration: 1000,
    delay: 100,
  })
  .add({
    targets: '.title .letter',
    opacity: [0, 1],
    easing: 'easeOutExpo',
    duration: 500,
    offset: '-= 10', // Starts 100ms before the previous animation ends
    delay: (el, i) => 34 * (i + 1),
  })
  .add({
    targets: '.title',
    opacity: 0,
    duration: 1000,
    easing: 'easeOutExpo',
    delay: 100,
  })

//------//
anime
  .timeline({
    targets: '.image-first',
    translateX: -20,
    scale: 1.2,
  })
  .add({
    targets: '.image-second',
    translateX: 35,
    scale: 1.2,
  })
