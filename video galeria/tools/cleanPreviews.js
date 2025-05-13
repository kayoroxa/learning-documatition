const fs = require('fs')
const path = require('path')

const previewsDir = path.join(__dirname, '..', 'output', 'previews')
const maxAgeHours = 3

function isLocked(filePath) {
  const lockPath = filePath.replace(/\.mp4$/, '.lock')
  return fs.existsSync(lockPath)
}

function isOldEnough(stats) {
  const now = Date.now()
  const lastAccess = new Date(stats.atime).getTime()
  const ageHours = (now - lastAccess) / (1000 * 60 * 60)
  return ageHours > maxAgeHours
}

function cleanPreviews() {
  if (!fs.existsSync(previewsDir)) return

  const files = fs.readdirSync(previewsDir)
  const mp4s = files.filter(f => f.endsWith('.mp4'))

  let deleted = 0

  mp4s.forEach(file => {
    const fullPath = path.join(previewsDir, file)

    try {
      const stats = fs.statSync(fullPath)
      if (!isOldEnough(stats)) return
      if (isLocked(fullPath)) return

      fs.unlinkSync(fullPath)
      deleted++
      console.log(`[🧼 excluído] ${file}`)
    } catch (err) {
      console.warn(`[⚠️ erro ao excluir] ${file}:`, err.message)
    }
  })

  if (deleted === 0) {
    console.log('[🧼 limpador] Nenhum arquivo para excluir.')
  }
}

cleanPreviews()
