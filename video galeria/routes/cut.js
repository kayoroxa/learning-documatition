const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()

const { sanitizePath, VIDEOS_BASE_PATH, FINAL_PATH, PREVIEWS_PATH  } = require('../utils/paths')
const {
  getPreviewFilename,
  createCutLimited,
} = require('../utils/ffmpegQueue')
const { getCacheEntry } = require('../utils/cache')
const { log } = require('../utils/logger')
const { CUT_OPTS } = require('../utils/ffmpegConfig')

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
  const compatible = !!meta.compatible

  const previewName = getPreviewFilename(videoPath, start, clipDuration)
  const previewPath = path.join(PREVIEWS_PATH, previewName)
  const finalPath = path.join(FINAL_PATH, previewName)

    try {
    if (fs.existsSync(finalPath)) {
      log('cut', `ℹ️ Já existia: ${previewName}`, 'info')
      log('cut', null, 'end')
      return res.status(200).send({ message: 'Corte já existe', output: `/output/final/${previewName}` })
    }

    if (CUT_OPTS.ALLOW_PREVIEW_AS_SRC && fs.existsSync(previewPath)) {
      fs.copyFileSync(previewPath, finalPath)
      log('cut', `♻️ Reutilizando preview existente (rollback ativo): ${previewName}`, 'warn')
      log('cut', null, 'end')
      return res.status(200).send({ message: 'Corte criado via preview reutilizado', output: `/output/final/${previewName}` })
    }

    log('cut', `🎬 Gerando corte novo: ${previewName}`, 'info')
    const resultPath = await createCutLimited(videoPath, start, clipDuration, compatible, finalPath)

    if (!fs.existsSync(resultPath)) {
      log('cut', `⚠️ FFmpeg retornou sucesso, mas arquivo não foi encontrado: ${resultPath}`, 'warn')
      log('cut', null, 'end')
      return res.status(500).send('Arquivo não foi gerado corretamente')
    }

    log('cut', `✅ Corte criado: ${previewName}`, 'info')
    log('cut', null, 'end')
    return res.status(200).send({ message: 'Corte criado com sucesso', output: `/output/final/${previewName}` })

  } catch (err) {
    log('cut', `❌ Erro ao gerar corte: ${err.message}`, 'error')
    log('cut', null, 'end')
    return res.status(500).send('Erro ao cortar vídeo')
  }

})

module.exports = router
