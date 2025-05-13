const { log } = require('./logger')

function shuffle(array) {
  if (!Array.isArray(array)) {
    log('shuffle', 'Valor passado não é array', 'warn')
    log('shuffle', array, 'warn')
    return []
  }

  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  return copy
}

module.exports = { shuffle }