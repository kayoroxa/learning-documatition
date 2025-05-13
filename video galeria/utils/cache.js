const fs = require('fs')
const path = require('path')
const { DURATION_CACHE_FILE } = require('./paths')
const { log } = require('./logger') 

// 🔑 Gera chave relativa padronizada
function getRelativeKey(videoPath, rootPath) {
  return path.relative(rootPath, videoPath).replaceAll('\\', '/')
}

// 🔍 Lê duração do cache, com fallback seguro
function getCachedDuration(key) {
  if (!fs.existsSync(DURATION_CACHE_FILE)) {
    log('durationCache', `Arquivo ainda não existe: ${DURATION_CACHE_FILE}`, 'warn')
    return null
  }

  try {
    const data = fs.readFileSync(DURATION_CACHE_FILE, 'utf-8')
    const json = JSON.parse(data)
    const entry = json[key]

    if (!entry || typeof entry.duration !== 'number') {
      log('durationCache', `Entrada inválida ou ausente para: ${key}`, 'warn')
      return null
    }

    return entry.duration
  } catch (err) {
    log('durationCache', `Erro ao ler ou parsear: ${err.message}`, 'error')
    return null
  }
}

function getCacheEntry(key) {
  try {
    const json = JSON.parse(fs.readFileSync(DURATION_CACHE_FILE, 'utf-8'))
    return json[key] || null
  } catch (err) {
    log('durationCache', `Erro ao acessar cache para chave: ${key}`, 'error')
    return null
  }
}

module.exports = {
  getRelativeKey,
  getCachedDuration,
  getCacheEntry
}
