const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()

const { log } = require('../utils/logger')

const lockFile = path.join(__dirname, '..', 'output', 'lock.txt')

router.get('/lock', (req, res) => {
  log('lock', null, 'groupCollapsed')
  try {
    if (fs.existsSync(lockFile)) {
      const content = fs.readFileSync(lockFile, 'utf-8')
      log('lock', `🔒 Lock ativo: ${content}`, 'info')
      res.status(200).send(content)
    } else {
      log('lock', '🔓 Nenhum lock ativo', 'info')
      res.status(204).send() // No Content
    }
  } catch (err) {
    log('lock', `Erro ao ler lock: ${err.message}`, 'error')
    res.status(500).send('Erro ao verificar lock')
  }
  log('lock', null, 'end')
})

router.post('/lock', (req, res) => {
  log('lock', null, 'groupCollapsed')
  try {
    const reason = req.query.reason || 'manual'
    fs.writeFileSync(lockFile, reason)
    log('lock', `🔒 Lock ativado: ${reason}`, 'info')
    res.status(200).send('Lock ativado')
  } catch (err) {
    log('lock', `Erro ao ativar lock: ${err.message}`, 'error')
    res.status(500).send('Erro ao ativar lock')
  }
  log('lock', null, 'end')
})

router.delete('/lock', (req, res) => {
  log('lock', null, 'groupCollapsed')
  try {
    if (fs.existsSync(lockFile)) {
      fs.unlinkSync(lockFile)
      log('lock', '🔓 Lock removido', 'info')
    } else {
      log('lock', '🔓 Nenhum lock para remover', 'info')
    }
    res.status(200).send('Lock removido')
  } catch (err) {
    log('lock', `Erro ao remover lock: ${err.message}`, 'error')
    res.status(500).send('Erro ao remover lock')
  }
  log('lock', null, 'end')
})

module.exports = router
