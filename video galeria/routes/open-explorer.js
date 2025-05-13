const express = require('express')
const router = express.Router()
const { exec } = require('child_process')
const path = require('path')
const { log } = require('../utils/logger')

router.get('/', (req, res) => {
  const original = req.query.path

  log('explorer', null, 'groupCollapsed')

  if (!original) {
    log('explorer', 'Parâmetro "path" ausente', 'warn')
    log('explorer', null, 'end')
    return res.status(400).json({ success: false, error: 'Missing path' })
  }

  const fullPath = path.resolve(original)
  log('explorer', `Tentando abrir explorer para: ${fullPath}`, 'info')

  exec(`explorer.exe /select,"${fullPath}"`, (err) => {
    if (err) {
      log('explorer', `Erro ao executar explorer.exe: ${err.message}`, 'error')
      log('explorer', null, 'end')
      return res.status(500).json({ success: false })
    }

    log('explorer', 'Explorer aberto com sucesso', 'info')
    log('explorer', null, 'end')
    res.json({ success: true })
  })
})

module.exports = router
