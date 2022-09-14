var bntFocusInVideo = document.querySelector('.bnt-focus-in-video')
var bntReset = document.querySelector('.bnt-reset')
var containerSuper = document.querySelector('.container-superior-All')
var containerVideo = document.querySelector('.video-container-6')

// bntFocusInVideo.addEventListener('click', function focus() {
//   var cloneComp = containerVideo.cloneNode(true)
//   cloneComp.setAttribute('id', 'Video-Focus')

//   if (containerSuper.classList.contains('hide')) {
//     containerSuper.classList.remove('hide')
//     containerSuper.appendChild(cloneComp)
//   } else containerSuper.classList.add('hide')

//   if (containerSuper.childNodes.length > 4) {
//     containerSuper.removeChild(cloneComp)
//   }
// })

bntReset.addEventListener('click', function reset() {
  containerSuper.classList.add('hide')
  var getClass = this.classList[1]
  var ale = getClass
  console.log(typeof ale, getClass)
})

bntFocusInVideo.addEventListener('click', function focus() {
  var getClass = this.classList[2]
  var classString = toString(getClass)
  console.log(getClass, typeof classString, classString)
})
