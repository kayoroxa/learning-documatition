const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { exec } = require('child_process')
const { promisify } = require('util')
const { VIDEOS_BASE_PATH, DURATION_CACHE_FILE } = require('./paths')
const { getCodecs, findGoodSceneStart } = require('./sceneDetector')
const { log } = require('./logger')

const execAsync = promisify(exec)
const limit = require('p-limit')(2)

const CACHE_FILE = DURATION_CACHE_FILE
const cache = {}

function loadCache() {
  if (!fs.existsSync(CACHE_FILE)) {
    log('warmup', 'Cache ainda não existe', 'warn')
    return
  }

  try {
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    Object.assign(cache, parsed)
    log('warmup', `Cache carregado: ${Object.keys(parsed).length} itens`, 'info')
  } catch (err) {
    log('warmup', `Erro ao ler cache: ${err.message}`, 'error')
  }
}

function saveCache(verbose = false) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
    if (verbose) log('warmup', `Cache salvo: ${Object.keys(cache).length} itens`, 'info')
  } catch (err) {
    log('warmup', `Erro ao salvar cache: ${err.message}`, 'error')
  }
}

function getAllVideos(dir) {
  let results = []
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        results = results.concat(getAllVideos(fullPath))
      } else if (
        entry.isFile() &&
        /\.(mp4|mkv|avi|mov|wmv)$/i.test(entry.name) 
      ) {
        results.push(fullPath)
      }
    }
  } catch (err) {
    log('warmup', `Erro ao ler pasta "${dir}": ${err.message}`, 'error')
  }
  return results
}

function getFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath)
    const hash = crypto.createHash('sha1')
    stream.on('data', chunk => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

async function getDuration(file) {
  const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${file}"`
  const { stdout } = await execAsync(cmd)
  const val = parseFloat(stdout.trim())
  if (isNaN(val)) throw new Error('Duração inválida')
  return val
}

async function warmupCache() {
  console.time('[warmup]')
  loadCache()

  const all = getAllVideos(VIDEOS_BASE_PATH)
  const total = all.length
  log('warmup', `📂 Vídeos encontrados: ${total}`, 'info')

  let index = 0
  let novos = 0
  let renomeados = 0
  let ignorados = 0
  let erros = 0

  const tasks = all.map(file =>
    limit(async () => {
      const i = ++index
      const rel = path.relative(VIDEOS_BASE_PATH, file).replaceAll('\\', '/')
      const label = `(${i}/${total}) ${rel}`

      log('warmup', null, 'groupCollapsed')

      try {
        const stats = fs.statSync(file)
        const mod = stats.mtimeMs
        const size = stats.size

        const entry = cache[rel]
        if (entry && entry.mod === mod && entry.size === size) {
          log('warmup', `${label} ⏩ pulado (cache válido)`, 'info')
          ignorados++
          return
        }

        const hash = await getFileHash(file)

        const antigo = Object.keys(cache).find(k => cache[k].hash === hash)
        if (antigo) {
          cache[rel] = { ...cache[antigo], mod, size }
          delete cache[antigo]
          renomeados++
          log('warmup', `🔄 Renomeado: ${antigo} → ${rel}`, 'info')
          return
        }

        log('warmup', `⏳ Novo vídeo: ${rel}`, 'info')

        const duration = await getDuration(file)
        log('warmup', `🎯 Duração: ${duration}s`, 'info')

        const codecs = await getCodecs(file)
        log('warmup', `🎥 Codecs: ${JSON.stringify(codecs)}`, 'info')

        const sceneStart = await findGoodSceneStart(file)
        log('warmup', `🎬 Cena inicial: ${sceneStart}s`, 'info')

        cache[rel] = { duration, ...codecs, mod, size, hash, sceneStart }
        novos++
        log('warmup', `✅ Cacheado e salvo: ${rel}`, 'info')
      } catch (err) {
        erros++
        log('warmup', `❌ Erro processando ${rel}: ${err.message}`, 'error')
      } finally {
        saveCache(false)
        log('warmup', null, 'end')
      }
    })
  )

  await Promise.all(tasks)

  log('warmup', `✅ Finalizado: ${novos} novos, ${renomeados} renomeados, ${ignorados} ignorados, ${erros} erros`, 'info')
  console.timeEnd('[warmup]')
}

module.exports = { warmupCache, getAllVideos, loadCache }
