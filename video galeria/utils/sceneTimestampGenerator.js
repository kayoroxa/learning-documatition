const { log } = require('./logger')

const seenStarts = new Map()

function isOverlapping(start, seenList, margin = 10) {
  return seenList.some(prev => Math.abs(start - prev) < margin)
}

function generateSmartStart(duration, videoPath, options = {}) {
  const margin = options.margin || 10
  const maxTries = options.maxTries || 10
  const maxMemory = options.maxMemory || 2

  if (!duration || typeof duration !== 'number' || duration <= 10) {
    log('timestamp', `Duração inválida para ${videoPath}: ${duration}`, 'warn')
    return 0
  }

  const maxStart = duration - 10
  const seen = seenStarts.get(videoPath) || []

  for (let i = 0; i < maxTries; i++) {
    const candidate = Math.random() * maxStart
    if (!isOverlapping(candidate, seen, margin)) {
      const final = Math.floor(candidate)
      seen.push(final)
      if (seen.length > maxMemory) seen.shift()
      seenStarts.set(videoPath, seen)
      return final
    }
  }

  // fallback: ainda tenta ser diferente dos últimos
  const fallback = Math.floor(Math.random() * maxStart)
  seen.push(fallback)
  if (seen.length > maxMemory) seen.shift()
  seenStarts.set(videoPath, seen)

  log('timestamp', `Usando fallback após ${maxTries} tentativas para ${videoPath}`, 'warn')
  return fallback
}

module.exports = {
  generateSmartStart
}
