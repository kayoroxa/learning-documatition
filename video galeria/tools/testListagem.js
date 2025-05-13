const { getAllVideos } = require('../utils/warmupCache')
const { VIDEOS_BASE_PATH } = require('../utils/paths')
const {log} = require('../utils/logger')
const fs = require('fs')
const path = require('path')

const allFromWarmup = getAllVideos(VIDEOS_BASE_PATH)

function listVideosRecursively(dir) {
  let results = []
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const ent of entries) {
      const full = path.join(dir, ent.name)
      if (ent.isDirectory()) {
        results = results.concat(listVideosRecursively(full))
      } else if (/\.(mp4|mkv)$/i.test(ent.name)) {
        results.push(full)
      }
    }
  } catch (err) {
    log('videos', `Erro ao ler recursivamente: ${dir} → ${err.message}`, 'error')
  }
  return results
}

const allFromRoute = listVideosRecursively(VIDEOS_BASE_PATH)

console.log('▶️ getAllVideos:', allFromWarmup.length)
console.log('▶️ listVideosRecursively:', allFromRoute.length)

// Verifica diferenças
const diff = allFromWarmup.filter(v => !allFromRoute.includes(v))
console.log('⚠️ Diferenças (presentes no warmup, ausentes na rota):')
console.log(diff)
