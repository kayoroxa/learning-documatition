const express = require('express')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const router = express.Router()

const { sanitizePath, VIDEOS_BASE_PATH } = require('../utils/paths')
const { getPreviewFilename, limitFfmpeg, createPreviewLimited } = require('../utils/ffmpegQueue')
const { getCacheEntry } = require('../utils/cache')
const { log } = require('../utils/logger')

const finalDir = path.join(__dirname, '..', 'output', 'final')
const previewsDir = path.join(__dirname, '..', 'output', 'previews')

router.post('/cut', async (req, res) => {
  const videoPath = sanitizePath(req.query.path)
  const start = parseFloat(req.query.start)
  const clipDuration = parseFloat(req.query.clipDuration || 10)

  log('cut', null, 'groupCollapsed')

  if (!videoPath || isNaN(start)) {
    log('cut', { videoPath, start }, 'error')
    log('cut', null, 'end')
    return res.status(400).send('Parâmetros inválidos')
  }

  const relKey = path.relative(VIDEOS_BASE_PATH, videoPath).replaceAll('\\', '/')
  const meta = getCacheEntry(relKey) || {}
  const useCopy = !!meta.compatible

  const previewName = getPreviewFilename(videoPath, start, clipDuration)
  const previewPath = path.join(previewsDir, previewName)
  const finalPath = path.join(finalDir, previewName)

  try {
    if (fs.existsSync(finalPath)) {
      log('cut', `ℹ️ Já existia: ${previewName}`, 'info')
      log('cut', null, 'end')
      return res.status(200).send({ message: 'Corte já existe', output: `/output/final/${previewName}` })
    }

    if (useCopy && fs.existsSync(previewPath)) {
      log('cut', `♻️ Reutilizando preview existente: ${previewName}`, 'info')
      fs.copyFileSync(previewPath, finalPath)
      log('cut', null, 'end')
      return res.status(200).send({ message: 'Corte criado via copy', output: `/output/final/${previewName}` })
    }

    log('cut', `🎬 Gerando preview: ${previewName}`, 'info')
    const created = await createPreviewLimited(videoPath, start, clipDuration, useCopy)
    fs.copyFileSync(created, finalPath)
    log('cut', `✅ Criado via preview copy: ${previewName}`, 'info')
    log('cut', null, 'end')
    return res.status(200).send({ message: 'Corte criado via preview', output: `/output/final/${previewName}` })

  } catch (err) {
    log('cut', `❌ Erro ao gerar/copy: ${err.message}`, 'error')

    const cmd = `ffmpeg -y -ss ${start} -i "${videoPath}" -t ${clipDuration} -c:v libx264 -preset ultrafast -c:a aac "${finalPath}"`

    try {
      await limitFfmpeg(() =>
        new Promise((yes, no) => exec(cmd, err => (err ? no(err) : yes())))
      )()
      log('cut', `✅ Criado via re-encode fallback: ${previewName}`, 'info')
      log('cut', null, 'end')
      return res.status(200).send({ message: 'Corte criado via fallback', output: `/output/final/${previewName}` })
    } catch (fallbackErr) {
      log('cut', `❌ Fallback também falhou: ${fallbackErr.message}`, 'error')
      log('cut', null, 'end')
      return res.status(500).send('Erro ao cortar vídeo')
    }
  }
})

module.exports = router
