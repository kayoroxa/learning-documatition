const { exec } = require('child_process')
const { log } = require('./logger')

function isCompatibleCodec(videoPath) {
  return new Promise((resolve) => {
    const cmdVideo = `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1 "${videoPath}"`
    const cmdAudio = `ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of default=noprint_wrappers=1 "${videoPath}"`

    let codec = '', audio = ''

    exec(cmdVideo, (errV, stdoutV) => {
      if (errV) {
        log('codec', `Erro ao detectar codec de vídeo: ${errV.message}`, 'error')
        return resolve({ codec: null, audio: null, compatible: false })
      }

      codec = stdoutV.trim()

      exec(cmdAudio, (errA, stdoutA) => {
        if (errA) {
          log('codec', `Erro ao detectar codec de áudio: ${errA.message}`, 'error')
          return resolve({ codec, audio: null, compatible: false })
        }

        audio = stdoutA.trim()
        const compatible = codec === 'h264' && audio === 'aac'

        resolve({ codec, audio, compatible })
      })
    })
  })
}

module.exports = { isCompatibleCodec }
