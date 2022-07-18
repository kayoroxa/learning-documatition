anime({
  targets: '.shape2',
  strokeDashoffset: [anime.setDashoffset, 0],
  easing: 'easeInOutSine',
  duration: 700,
  delay: function (el, i) {
    return i * 250
  },
  direction: 'alternate',
  loop: true,