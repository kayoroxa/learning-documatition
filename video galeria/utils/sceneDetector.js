const { exec } = require('child_process')
const { promisify } = require('util')
const { isCompatibleCodec } = require('./codecDetector')
const { shuffle } = require('../utils/shuffle')
const { log } = require('./logger')

const execAsync = promisify(exec)
const sceneCache = new Map()

function parseSceneTimestamps(output, duration) {
  const timestamps = []
  const regex = /pts_time:([0-9.]+)/g
  let match
  while ((match = regex.exec(output)) !== null) {
    const time = parseFloat(match[1])
    if (!isNaN(time) && time < duration - 10) {
      timestamps.push(time)
    }
  }

  if (timestamps.length === 0) {
    log('scene', 'Nenhuma cena detectada em parseSceneTimestamps', 'warn')
  }

  return timestamps
}

function detectScenes(videoPath, duration) {
  return new Promise((resolve, reject) => {
    if (sceneCache.has(videoPath)) {
      return resolve(sceneCache.get(videoPath))
    }

    const cmd = `ffmpeg -i "${videoPath}" -filter_complex "select='gt(scene,0.4)',metadata=print" -an -f null -`

    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
      if (err) {
        log('scene', `Erro no ffmpeg detectScenes: ${err.message}`, 'error')
        return reject(err)
      }

      const raw = stdout + stderr
      const scenes = parseSceneTimestamps(raw, duration)

      if (scenes.length === 0) {
        log('scene', 'Nenhuma cena detectada', 'warn')
      }

      sceneCache.set(videoPath, scenes)
      resolve(scenes)
    })
  })
}

function pickSceneTimestamp(scenes) {
  if (!scenes || scenes.length === 0) {
    log('scene', 'Lista de cenas vazia em pickSceneTimestamp', 'warn')
    return null
  }

  const idx = Math.floor(Math.random() * scenes.length)
  return Math.floor(scenes[idx])
}

async function findGoodSceneStart(videoPath) {
  try {
    const durationRaw = await execPromise(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
    )
    const duration = parseFloat(durationRaw.trim()) || 180
    const chosenMinStart = Math.floor(Math.random() * 14) + 2
    const max = Math.min(duration - 10, 90)

    const candidates = []
    for (let i = 0; i < 10; i++) {
      const t = Math.floor(Math.random() * (max - chosenMinStart)) + chosenMinStart
      if (!candidates.includes(t)) candidates.push(t)
    }

    const attempts = shuffle(candidates)

    for (const t of attempts) {
      const cmd = `ffmpeg -ss ${t} -i "${videoPath}" -t 3 -vf "blackdetect=d=0.2:pic_th=0.98,cropdetect=24:16:0" -an -f null -`

      try {
        const output = await execPromise(cmd)
        const hasBlack = /black_start/.test(output)
        const cropMatches = output.match(/crop=(\d+):(\d+):(\d+):(\d+)/)

        let hasText = false
        if (cropMatches) {
          const cropH = parseInt(cropMatches[2])
          if (!isNaN(cropH) && cropH < 250) hasText = true
        }

        if (!hasBlack && !hasText) {
          return t
        }
      } catch (err) {
        log('scene', `Erro ao testar ${t}s: ${err.message}`, 'warn')
      }
    }

    const fallback = Math.floor(duration * 0.25)
    log('scene', `Fallback usado em findGoodSceneStart: ${fallback}s`, 'warn')
    return fallback
  } catch (err) {
    log('scene', `Erro em findGoodSceneStart: ${err.message}`, 'error')
    return 30
  }
}

function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
      if (err) return reject(err)
      resolve(stdout + stderr)
    })
  })
}

async function getCodecs(videoPath) {
  log('codec', null, 'groupCollapsed')
  try {
    const { codec, audio, compatible } = await isCompatibleCodec(videoPath)
    log('codec', { video: codec, audio, compatible }, 'info')
    return { codec_video: codec, codec_audio: audio, compatible }
  } catch (err) {
    log('codec', `Erro ao obter codecs: ${err.message}`, 'error')
    return { codec_video: null, codec_audio: null, compatible: false }
  } finally {
    log('codec', null, 'end')
  }
}

module.exports = {
  detectScenes,
  pickSceneTimestamp,
  findGoodSceneStart,
  getCodecs
}
