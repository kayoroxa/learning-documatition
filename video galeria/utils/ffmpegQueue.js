const path = require('path')
const { exec } = require('child_process')
const fs = require('fs')
const { log } = require('./logger')

let limitFn = null

function limitFfmpeg(fn) {
  return async (...args) => {
    if (!limitFn) {
      const pLimit = (await import('p-limit')).default
      limitFn = pLimit(2)
    }

    return limitFn(() => fn(...args))
  }
}

function getPreviewFilename(videoPath, start, duration) {
  const base = path.basename(videoPath).replace(/\W+/g, '_').replace(/\.(mp4|mkv)$/i, '')
  return `${base}_s${start}_d${duration}.mp4`
}

function createPreviewLimited(videoPath, start, duration, useCopy = false, signal) {
  const outputFile = getPreviewFilename(videoPath, start, duration)
  const outputPath = path.join(__dirname, '..', 'output', 'previews', outputFile)

  if (fs.existsSync(outputPath)) {
    log('ffmpeg', `Preview já existia: ${outputFile}`, 'warn')
    return Promise.resolve(outputPath)
  }

  const cmd = useCopy
    ? `ffmpeg -y -ss ${start} -i "${videoPath}" -t ${duration} -c copy "${outputPath}"`
    : `ffmpeg -y -ss ${start} -i "${videoPath}" -t ${duration} -c:v libx264 -preset veryfast -c:a aac "${outputPath}"`

  return limitFfmpeg(() => new Promise((resolve, reject) => {
    const proc = exec(cmd, (err) => {
      if (err) {
        log('ffmpeg', `Falha ao gerar preview: ${err.message}`, 'error')
        return reject(err)
      }
      resolve(outputPath)
    })

    if (signal) {
      signal.addEventListener('abort', () => {
        proc.kill('SIGKILL')
        log('ffmpeg', `Preview cancelado via AbortController`, 'warn')
        reject(new Error('Preview abortado'))
      }, { once: true })
    }
  }))()
}

module.exports = {
  limitFfmpeg,
  createPreviewLimited,
  getPreviewFilename
}
