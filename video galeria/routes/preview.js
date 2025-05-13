const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()

const { sanitizePath, VIDEOS_BASE_PATH } = require('../utils/paths')
const { getRelativeKey, getCachedDuration } = require('../utils/cache')
const { createPreviewLimited } = require('../utils/ffmpegQueue')
const { log } = require('../utils/logger')

router.get('/preview', async (req, res) => {
  const videoPath = sanitizePath(req.query.path)
  const start = Number(req.query.start)
  const clipDuration = Number(req.query.duration || 10)

  log('preview', null, 'groupCollapsed')
  log('preview', { videoPath, start, clipDuration }, 'info')

  if (!videoPath || isNaN(start) || isNaN(clipDuration)) {
    log('preview', 'Parâmetros inválidos', 'warn')
    log('preview', null, 'end')
    return res.status(400).send('Parâmetros inválidos')
  }

  if (!fs.existsSync(videoPath)) {
    log('preview', `Arquivo não encontrado: ${videoPath}`, 'warn')
    log('preview', null, 'end')
    return res.status(404).send('Arquivo não encontrado')
  }

  const relativeKey = getRelativeKey(videoPath, VIDEOS_BASE_PATH)
  const duration = getCachedDuration(relativeKey)

  if (duration == null) {
    log('preview', `Duração não encontrada no cache para: ${relativeKey}`, 'warn')
    log('preview', null, 'end')
    return res.status(500).send('Duração não disponível no cache')
  }

  const cached = require('../durationCache.json')[relativeKey]
  const compatible = cached?.compatible ?? false

  const abortController = new AbortController()
  const { signal } = abortController

  req.on('close', () => {
    abortController.abort()
    log('preview', '🛑 Cliente desconectou — geração de preview cancelada', 'warn')
  })

  try {
    const file = await createPreviewLimited(videoPath, start, clipDuration, compatible, signal)
    if (signal.aborted) {
      log('preview', '⚠️ Preview descartado pois a conexão foi encerrada', 'warn')
      log('preview', null, 'end')
      return
    }

    log('preview', `Preview criado com sucesso: ${file}`, 'info')
    log('preview', null, 'end')
    res.sendFile(file)
  } catch (err) {
    if (signal.aborted) {
      log('preview', '🛑 Geração de preview abortada com sucesso', 'warn')
    } else {
      log('preview', `Erro ao gerar preview: ${err.message}`, 'error')
    }
    log('preview', null, 'end')
    res.status(500).send('Erro interno ao gerar preview')
  }
})

router.get('/smart-preview', (req, res) => {
  const videoPath = sanitizePath(req.query.path)
  const relativeKey = getRelativeKey(videoPath, VIDEOS_BASE_PATH)
  const cache = require('../durationCache.json')[relativeKey]

  if (!cache || typeof cache.sceneStart !== 'number') {
    log('smart-preview', `Start ausente no cache para: ${relativeKey}`, 'warn')
    return res.status(400).send('Parâmetros inválidos ou start ausente')
  }

  log('smart-preview', `Start retornado: ${cache.sceneStart}`, 'info')
  return res.status(200).json({ start: cache.sceneStart })
})

module.exports = router
