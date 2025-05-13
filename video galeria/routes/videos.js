const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()

const { VIDEOS_BASE_PATH } = require('../utils/paths')
const { ROOT_FOLDER_KEY } = require('../utils/constants')
const { getCachedDuration, getRelativeKey } = require('../utils/cache')
const { shuffle } = require('../utils/shuffle.js')
const { log } = require('../utils/logger')

function listVideosRecursively(dir) {
  let results = []
  try {
    let entries = fs.readdirSync(dir, { withFileTypes: true })
    entries = shuffle(entries)

    for (const ent of entries) {
      const full = path.join(dir, ent.name)
      if (ent.isDirectory()) {
        results = results.concat(listVideosRecursively(full))
      } else if (/\.(mp4|mkv|avi|mov|wmv|webm)$/i.test(ent.name)) {
        results.push(full)
      }
    }
  } catch (err) {
    log('videos', `Erro ao ler recursivamente: ${dir} → ${err.message}`, 'error')
  }
  return results
}

router.get('/videos', (req, res) => {
  const folder = req.query.folder
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 12)
  log('videos', null, 'groupCollapsed')

  if (!folder) {
    log('videos', 'Parâmetro folder ausente', 'warn')
    log('videos', null, 'end')
    return res.status(400).send('Parâmetro folder obrigatório')
  }

  if (folder !== ROOT_FOLDER_KEY && (folder.includes('..') || path.isAbsolute(folder))) {
    log('videos', `Folder inválido recebido: ${folder}`, 'warn')
    log('videos', null, 'end')
    return res.status(400).send('Folder inválido')
  }

  let basePath = VIDEOS_BASE_PATH

  if (folder !== ROOT_FOLDER_KEY) {
    try {
      const entries = fs.readdirSync(VIDEOS_BASE_PATH, { withFileTypes: true })
      const matched = entries.find(
        e => e.isDirectory() && e.name.toLowerCase() === folder.toLowerCase()
      )

      if (!matched) {
        log('videos', `Pasta não encontrada (case-insensitive): ${folder}`, 'warn')
        log('videos', null, 'end')
        return res.status(404).send('Pasta não encontrada')
      }

      basePath = path.join(VIDEOS_BASE_PATH, matched.name)
    } catch (err) {
      log('videos', `Erro ao acessar basePath: ${err.message}`, 'error')
      log('videos', null, 'end')
      return res.status(500).send('Erro ao acessar pasta')
    }
  }

  try {
    let filePaths = []

    const subdirs = fs.readdirSync(basePath, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => path.join(basePath, e.name))

    const shouldBalance = folder === ROOT_FOLDER_KEY || subdirs.length > 0

    if (shouldBalance) {
      const allFolders = [basePath, ...shuffle(subdirs)]
      const perFolderLimit = Math.max(1, Math.floor(limit * 0.2))

      log('videos', `🎛️ Balanceamento: até ${perFolderLimit} por pasta`, 'info')

      for (const folderPath of allFolders) {
        const localVideos = listVideosRecursively(folderPath)
        const sampled = shuffle(localVideos).slice(0, perFolderLimit)
        filePaths.push(...sampled)
      }

      filePaths = shuffle(filePaths).slice(0, limit)

      log('videos', `📊 Balanceado entre ${allFolders.length} pastas`, 'info')
    } else {
      filePaths = fs.readdirSync(basePath)
        .filter(name => {
          const full = path.join(basePath, name)
          return fs.lstatSync(full).isFile() && /\.(mp4|mkv|avi|mov|wmv|webm)$/i.test(name)
        })
        .map(name => path.join(basePath, name))

      shuffle(filePaths)
      filePaths = filePaths.slice(0, limit)

      log('videos', `📄 Pasta simples sem subpastas`, 'info')
    }

    const videos = filePaths
      .map(fullPath => {
        const name = path.basename(fullPath)

        try {
          const relKey = getRelativeKey(fullPath, VIDEOS_BASE_PATH)
          const duration = getCachedDuration(relKey)

          if (typeof duration !== 'number' || isNaN(duration) || duration <= 0) {
            log('videos', {
              name,
              relKey,
              duration,
              reason: 'Duração inválida ou ausente no cache'
            }, 'warn')
            return null
          }

          return { name, path: fullPath, duration }
        } catch (err) {
          log('videos', {
            name,
            fullPath,
            error: err.message
          }, 'warn')
          return null
        }
      })
      .filter(Boolean)

    log('videos', `🎞️ ${videos.length} vídeos encontrados em "${folder}"`, 'info')
    res.status(200).json({ videos })
  } catch (err) {
    log('videos', `Erro geral ao listar vídeos: ${err.message}`, 'error')
    res.status(500).send('Erro ao listar vídeos')
  } finally {
    log('videos', null, 'end')
  }
})

module.exports = router
