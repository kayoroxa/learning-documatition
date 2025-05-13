const path = require('path');
const { log } = require('./logger')

const VIDEOS_BASE_PATH = 'D:/Herbert/VIDEO CRAFT/Assets - DB/Videos/Filmes & youtube';

const DURATION_CACHE_FILE = path.join(__dirname, '..', 'durationCache.json')


function sanitizePath(input) {
  if (!input) return ''

  let decoded = input

  try {
    decoded = decodeURIComponent(input)
  } catch (err) {
    log('paths', `⚠️ decodeURIComponent falhou para: "${input}" → usando string original`, 'warn')
  }

  // Corrige separadores para o sistema operacional
  return decoded.replace(/\//g, path.sep)
}

module.exports = {
  sanitizePath,
  VIDEOS_BASE_PATH,
  DURATION_CACHE_FILE
}
