var bnt = document.querySelector('.bnt')
var containerSuper = document.querySelector('.container-superior-All')
var videoSixText = document.querySelector('#video-6-subtitle')
var videSixVideo = document.querySelector('#video-6')

bnt.addEventListener('click', function () {
  videoSixText.style.backgroundColor = 'red'
  var videoCloned = videSixVideo.cloneNode(true)
  containerSuper.appendChild(videoCloned)
  containerSuper.appendChild(videoSixText)
})

console.log(videSixVideo.childNodes)
