const express = require('express')
const router = express.Router()
const path = require('path')
const { exec } = require('child_process')
const { VIDEOS_BASE_PATH } = require('../utils/paths')

router.get('/test-cut-error', async (req, res) => {
  const videoPath = path.join(VIDEOS_BASE_PATH, 'Youtube videos Collage', 'Change by Marcel Bleustein-Blanchet.mp4')
  const start = 117
  const duration = 10
  const videoName = path.basename(videoPath, path.extname(videoPath)) // sem extensão
  const outputFile = `${videoName}_test.mp4`
  const outputPath = path.join(__dirname, '..', 'output', 'final', outputFile)


  const args = [
    '-ss', start.toString(),
    '-i', videoPath,
    '-t', duration.toString(),
    '-map', '0',
    '-map', '-0:2',  // testando se o erro persiste
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '18',
    '-c:a', 'aac',
    '-y', outputPath
  ]

  const ffmpegPath = 'ffmpeg' 
  const fullCommand = `${ffmpegPath} ${args.map(a => `"${a}"`).join(' ')}`

  exec(fullCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('[FFMPEG TEST]', stderr)
      return res.status(500).json({ error: 'Falha ao cortar vídeo', stderr })
    }
    res.json({ ok: true, outputPath })
  })
})

module.exports = router
