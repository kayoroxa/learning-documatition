const express = require('express')
const fs = require('fs')
const path = require('path')
const { warmupCache, getAllVideos, loadCache } = require('./utils/warmupCache')
const { VIDEOS_BASE_PATH, DURATION_CACHE_FILE, PREVIEWS_PATH, FINAL_PATH, OUTPUT_PATH } = require('./utils/paths') 
const { log } = require('./utils/logger')
const { cleanPreviews } = require('./utils/cleanup')


const app = express()
const port = 3000

// 🔘 Altere para true para ativar o warmup automático
const ENABLE_WARMUP_CACHE = false

// 🔘 Altere para true para limpar previews antigos ao iniciar
const ENABLE_CLEAN_PREVIEWS = true



async function start() {
  log('server', null, 'groupCollapsed')

  if (!fs.existsSync(PREVIEWS_PATH)) {
  fs.mkdirSync(PREVIEWS_PATH, { recursive: true })
  log('server', '📁 Pasta /previews criada', 'info')
  }

  if (!fs.existsSync(FINAL_PATH)) {
    fs.mkdirSync(FINAL_PATH, { recursive: true })
    log('server', '📁 Pasta /final criada', 'info')
  }


  app.use('/output', express.static(OUTPUT_PATH))
  app.use(express.static(path.join(__dirname, 'public')))

  if (ENABLE_WARMUP_CACHE) {
    log('warmup', '⚙️ Rodando análise completa de vídeos...', 'info')
    await warmupCache()
  } else {
    const allVideos = getAllVideos(VIDEOS_BASE_PATH)
    let currentCache = {}

    if (fs.existsSync(DURATION_CACHE_FILE)) {
      try {
        const raw = fs.readFileSync(DURATION_CACHE_FILE, 'utf-8')
        currentCache = JSON.parse(raw)
      } catch (err) {
        log('warmup', `Erro ao ler cache: ${err.message}`, 'warn')
      }
    }

    log('warmup', `🧊 Warmup OFF → Total vídeos: ${allVideos.length} | Cache: ${Object.keys(currentCache).length}`, 'info')
  }
  if (ENABLE_CLEAN_PREVIEWS) {
    log('cleanup', '🧼 Limpando previews antigos...', 'groupCollapsed')
    cleanPreviews()
    log('cleanup', null, 'end')
  }
  


  loadCache()
  log('cache', '📦 Cache de duração carregado', 'info')

  app.use('/', require('./routes/preview'))
  app.use('/', require('./routes/cut'))
  app.use('/', require('./routes/folders'))
  app.use('/', require('./routes/videos'))
  app.use('/', require('./routes/lock'))
  app.use('/', require('./routes/open-explorer'))
  app.use('/', require('./routes/diagnostic-duration'))


  app.listen(port, () => {
    log('server', `🚀 Servidor rodando em http://localhost:${port}`, 'info')
    log('server', null, 'end')
  })
}

start()
