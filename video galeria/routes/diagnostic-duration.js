const express = require('express')
const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const { log } = require('../utils/logger')

const router = express.Router()

router.get('/diagnostic-duration', (req, res) => {
  const input = req.query.path

  if (!input || !fs.existsSync(input)) {
    log('diagnostic', `Caminho inválido: ${input}`, 'warn')
    return res.status(400).send('Path inválido')
  }

  const decoded = decodeURIComponent(input)
  const fullPath = path.resolve(decoded)

  const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${fullPath}"`

  log('diagnostic', null, 'groupCollapsed')
  log('diagnostic', `Analisando: ${fullPath}`, 'info')
  log('diagnostic', `Comando: ${cmd}`, 'info')

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      log('diagnostic', `Erro ao rodar ffprobe: ${err.message}`, 'error')
    } else {
      const duration = parseFloat(stdout.trim())
      log('diagnostic', {
        path: fullPath,
        duration,
        raw: stdout.trim()
      }, 'info')
    }

    const ext = path.extname(fullPath)
    log('diagnostic', {
      ext,
      path: fullPath
    }, 'info')

    log('diagnostic', null, 'end')
    res.status(204).end() // Não retorna conteúdo
  })
})

module.exports = router
