const path = require('path')
const { spawn } = require('child_process')
const fs = require('fs')
const { log } = require('./logger')
const { PREVIEW_OPTS, CUT_OPTS } = require('./ffmpegConfig')
const { PREVIEWS_PATH } = require('./paths')

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

function runFfmpeg(args, label = 'ffmpeg', signal) {
  return new Promise((resolve, reject) => {
    const outputPath = args.at(-1)
    const ffmpeg = spawn('ffmpeg', args, { signal })

    let stderr = ''
    ffmpeg.stderr.on('data', data => {
      stderr += data.toString()
    })

    ffmpeg.on('close', code => {
      if (code === 0) {
        if (!fs.existsSync(outputPath)) {
          log(label, `⚠️ Processo finalizou, mas não criou o arquivo: ${outputPath}`, 'warn')
          return reject(new Error('Arquivo de saída não gerado'))
        }

        log(label, `✅ Arquivo criado: ${path.basename(outputPath)}`, 'info')
        return resolve(outputPath)
      }

      // Se falhou, salva o stderr inteiro em log de debug
      const logsDir = path.resolve(__dirname, '..', 'logs')
      if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir)

      const logFile = path.join(logsDir, `ffmpeg-${Date.now()}.log`)
      fs.writeFileSync(logFile, stderr)

      const resumo = stderr.length > 800 ? stderr.slice(0, 800) + '\n[...]' : stderr
      log(label, `❌ FFmpeg falhou com código ${code}. Log salvo em: ${path.basename(logFile)}`, 'error')
      return reject(new Error(`FFmpeg falhou. Veja ${logFile}`))
    })

    ffmpeg.on('error', err => {
      log(label, `❌ Erro ao executar FFmpeg: ${err.message}`, 'error')
      return reject(err)
    })

    ffmpeg.on('exit', (code, signal) => {
      if (signal) {
        log(label, `🛑 FFmpeg abortado via signal: ${signal}`, 'warn')
      }
    })
  })
}


function createPreviewLimited(videoPath, start, duration, useCopy = false, signal) {
  const FORCE_LOWRES_PREVIEW = PREVIEW_OPTS.ENABLE_LOWRES;
  const IS_INCOMPATIBLE_CODEC = !useCopy;

  const ENCODE_MODE = FORCE_LOWRES_PREVIEW
    ? 'lowres'
    : IS_INCOMPATIBLE_CODEC
      ? 'reencode'
      : 'copy';

  const outputFile = getPreviewFilename(videoPath, start, duration);
  const outputPath = path.join(PREVIEWS_PATH, outputFile)

  if (fs.existsSync(outputPath)) {
    log('preview', `📁 Preview já existia: ${outputFile}`, 'warn');
    return Promise.resolve(outputPath);
  }

  log('preview', {
    ENCODE_MODE,
    FORCE_LOWRES_PREVIEW,
    IS_INCOMPATIBLE_CODEC,
    outputFile
  }, 'info');

  let args = [];

  if (ENCODE_MODE === 'copy') {
    args = [
      '-y',
      '-ss', start,
      '-i', videoPath,
      '-t', duration,
      '-map', '0:v:0',
      '-c', 'copy',
      outputPath,
    ];
  } else {
    args = [
      '-y',
      '-ss', start,
      '-i', videoPath,
      '-t', duration,
      '-map', '0:v:0',
      ...(ENCODE_MODE === 'lowres'
        ? ['-vf', `scale=${PREVIEW_OPTS.SCALE},fps=${PREVIEW_OPTS.FPS}`]
        : []),
      '-preset', PREVIEW_OPTS.PRESET,
      '-crf', PREVIEW_OPTS.CRF,
      '-an',
      outputPath,
    ];
  }

  return limitFfmpeg(() =>
    runFfmpeg(args, 'preview', signal).then(() => {
      const label = ENCODE_MODE === 'copy'
        ? '✔️ Preview copiado com -c copy'
        : ENCODE_MODE === 'lowres'
          ? '✔️ Preview otimizado (lowres)'
          : '✔️ Preview reencodado (codec incompatível)';
      log('preview', `${label}: ${outputFile}`, 'info');
      return outputPath;
    })
  )();
}



function createCutLimited(videoPath, start, duration, compatible, outputPath, signal) {
  return limitFfmpeg(async () => {
    const precise = CUT_OPTS.PRECISE_CUT

    const baseArgs = precise
      ? ['-i', videoPath, '-ss', start]
      : ['-ss', start, '-i', videoPath]

    const copyArgs = [
      '-t', duration,
      '-map', '0:v:0',
      '-c', 'copy',
      '-y', outputPath
    ]

    const reencodeArgs = [
      '-t', duration,
      '-map', '0',
      '-c:v', 'libx264',
      '-preset', CUT_OPTS.HQ_PRESET,
      '-crf', CUT_OPTS.HQ_CRF,
      '-c:a', 'aac',
      '-y', outputPath
    ]

    const args = [
      ...baseArgs,
      ...(compatible && CUT_OPTS.COPY_WHEN_COMPATIBLE ? copyArgs : reencodeArgs)
    ]

    log('cut', `🎞️ FFmpeg args: ${args.join(' ')}`, 'info')

    try {
      await runFfmpeg(args, 'cut', signal)

      if (!fs.existsSync(outputPath)) {
        log('cut', `⚠️ Arquivo não encontrado após sucesso do FFmpeg: ${outputPath}`, 'warn')
        throw new Error('Arquivo não foi criado')
      }

      log('cut', `✅ Corte final salvo com sucesso: ${outputPath}`, 'info')
      return outputPath
    } catch (err) {
      if (err.name === 'AbortError' || err.message.includes('aborted')) {
        log('cut', '🛑 Corte abortado pelo cliente (AbortController)', 'warn')
      } else {
        log('cut', `❌ Erro durante corte FFmpeg: ${err.message}`, 'error')
      }
      throw err
    }
  })() 
}



module.exports = {
  limitFfmpeg,
  createPreviewLimited,
  getPreviewFilename,
  createCutLimited,
  runFfmpeg
}
