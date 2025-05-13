const path = require('path');
const { log } = require('./logger')

const VIDEOS_BASE_PATH = 'D:/Herbert/VIDEO CRAFT/Assets - DB/Videos/Filmes & youtube';

const DURATION_CACHE_FILE = path.join(__dirname, '..', 'durationCache.json')

const OUTPUT_PATH = path.join(__dirname, '..', 'output')
const PREVIEWS_PATH = path.join(OUTPUT_PATH, 'previews')
const FINAL_PATH = path.join(OUTPUT_PATH, 'final')
const LOCK_FILE = path.join(OUTPUT_PATH, 'lock.txt')

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
  DURATION_CACHE_FILE,
  PREVIEWS_PATH,
  FINAL_PATH,
  OUTPUT_PATH,
  LOCK_FILE
}
