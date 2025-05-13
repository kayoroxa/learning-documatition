const fs = require('fs')
const path = require('path')
const { log } = require('./logger')

const previewsDir = path.join(__dirname, '..', 'output', 'previews')

function isOldEnough(stats) {
  const idadeMin = (Date.now() - stats.mtimeMs) / 1000 / 60
  return idadeMin > 3
}

function isLocked(filePath) {
  return filePath.includes('lock')
}

function cleanPreviews() {
  let deleted = 0
  const exemplos = []

  try {
    const files = fs.readdirSync(previewsDir).filter(f => f.endsWith('.mp4'))

    for (const file of files) {
      const fullPath = path.join(previewsDir, file)

      try {
        const stats = fs.statSync(fullPath)
        if (!isOldEnough(stats)) continue
        if (isLocked(fullPath)) continue

        fs.unlinkSync(fullPath)
        deleted++
        if (exemplos.length < 5) exemplos.push(file)
      } catch (err) {
        log('cleanup', `⚠️ Erro ao excluir ${file}: ${err.message}`, 'warn')
      }
    }

    if (deleted === 0) {
      log('cleanup', 'Nenhum preview para excluir', 'info')
    } else {
      const extra = deleted > exemplos.length ? ` (+${deleted - exemplos.length} mais)` : ''
      log('cleanup', `🧼 ${deleted} previews excluídos:`, 'info')
      exemplos.forEach(name => log('cleanup', `  └─ ${name}`, 'info'))
      if (extra) log('cleanup', extra, 'info')
    }
  } catch (err) {
    log('cleanup', `❌ Erro ao acessar previewsDir: ${err.message}`, 'error')
  }
}


module.exports = {
  cleanPreviews,
}
