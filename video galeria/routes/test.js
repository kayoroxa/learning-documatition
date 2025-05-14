const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')
const { log } = require('../utils/logger')
const { VIDEOS_BASE_PATH } = require('../utils/paths')

router.get('/test-cut-error', async (req, res) => {
  log('cut-test', '🧪 Iniciando teste de corte com log', 'group')

  const logsDir = path.join(__dirname, '..', 'logs')
  const logFiles = fs.readdirSync(logsDir)
    .filter(name => name.startsWith('ffmpeg-ul') && name.endsWith('.log'))
    .map(name => ({
      name,
      full: path.join(logsDir, name),
      time: fs.statSync(path.join(logsDir, name)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time)

  if (logFiles.length === 0) {
    log('cut-test', '❌ Nenhum log encontrado', 'error')
    log('cut-test', null, 'end')
    return res.status(500).json({ error: 'Nenhum log encontrado' })
  }

  const latestLog = fs.readFileSync(logFiles[0].full, 'utf8')
  const match = latestLog.match(/from '(.+?)'/)

  if (!match) {
    log('cut-test', '❌ Caminho de vídeo não encontrado no log', 'error')
    log('cut-test', null, 'end')
    return res.status(500).json({ error: 'Caminho de vídeo não encontrado no log' })
  }

  const videoPath = match[1]
  const start = 117
  const duration = 10
  const videoName = path.basename(videoPath, path.extname(videoPath))
  const outputFile = `${videoName}_test.mp4`
  const outputPath = path.join(__dirname, '..', 'output', 'final', outputFile)

  const args = [
    '-ss', start.toString(),
    '-i', videoPath,
    '-t', duration.toString(),
    '-map', '0:v',
    '-map', '0:a',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '18',
    '-c:a', 'aac',
    '-y', outputPath
  ]

  const ffmpegPath = 'ffmpeg'
  const fullCommand = `${ffmpegPath} ${args.map(a => `"${a}"`).join(' ')}`

  log('cut-test', `🎬 Comando FFmpeg:\n${fullCommand}`, 'info')

  exec(fullCommand, (error, stdout, stderr) => {
    if (error) {
      log('cut-test', '❌ Falha ao executar FFmpeg', 'error')
      log('cut-test', stderr, 'error')
      log('cut-test', null, 'end')
      return res.status(500).json({ error: 'Falha ao cortar vídeo', stderr })
    }

    log('cut-test', `✅ Corte gerado: ${outputFile}`, 'info')
    log('cut-test', null, 'end')
    res.json({ ok: true, outputFile, outputPath })
  })
})

module.exports = router
