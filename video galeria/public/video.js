import { showNotification } from './utils/ui.js'
import {
  ROOT_FOLDER_KEY,
  DEFAULT_SLOT_COUNT,
  DEFAULT_SCENE_START,
  FOLDER_QUERY_PARAM
} from './utils/constants.js'
import {
  buildPreviewUrl,
  buildSmartPreviewUrl,
  buildVideosUrl,
  buildCutUrl,
  buildLockUrl
} from './utils/urls.js'
import { shuffle } from './utils/shuffle.js'
import { logStep } from './utils/logger.js'
import {
  createKillableTask,
  cancelTask
} from './utils/taskManager.js'

const gallery = document.querySelector('#gallery')

function getRandomizedStart(meta) {
  const safeStart = meta.sceneStart ?? DEFAULT_SCENE_START
  const maxStart = meta.duration - 10

  if (maxStart <= safeStart) {
    logStep('preview', '⚠️ Intervalo inválido. Usando sceneStart direto.', 'warn')
    logStep('preview', { safeStart, maxStart }, 'warn')
    return safeStart
  }

  const candidates = []
  for (let i = 0; i < 10; i++) {
    const rand = Math.floor(Math.random() * (maxStart - safeStart)) + safeStart
    candidates.push(rand)
  }

  return shuffle(candidates)[0]
}

export async function loadVideos(folder = ROOT_FOLDER_KEY) {
  const taskKey = 'loadVideos'
  cancelTask(taskKey)
  const controller = createKillableTask(taskKey)
  const { signal } = controller

  document.body.dataset.currentFolder = folder

  const url = new URL(window.location)
  url.searchParams.set(FOLDER_QUERY_PARAM, folder.toLowerCase().replaceAll(' ', '-'))
  window.history.replaceState(null, '', url)
  logStep('url', url.href, 'info')

  createSlotsIfNeeded()

  try {
    await fetch(buildLockUrl('preview'), { method: 'POST' })
    logStep('lock', '🔒 Ativado durante geração de previews', 'info')
  } catch (err) {
    logStep('lock', `⚠️ Falhou ao ativar lock: ${err.message}`, 'warn')
  }

  try {
    const res = await fetch(buildVideosUrl(folder), { signal })
    const data = await res.json()

    logStep('videos', `🎞️ ${data.videos.length} vídeos recebidos`, 'info')

    const limited = data.videos.slice(0, 12)

    for (let i = 0; i < limited.length; i++) {
      if (signal.aborted) return

      const video = limited[i]
      const slot = gallery.children[i]
      if (!slot) {
        logStep('slot', `⚠️ Slot #${i} não existe no DOM`, 'warn')
        continue
      }

      if (!video.duration || video.duration < 10 || isNaN(video.duration)) {
        logStep('slot', `⚠️ SLOT PULADO: Vídeo com duration inválida → ${video.name}`, 'warn')

        fetch(`/diagnostic-duration?path=${encodeURIComponent(video.path)}`)
          .then(() => logStep('diagnostic', `🧪 Diagnóstico iniciado para ${video.name}`, 'info'))
          .catch(err => logStep('diagnostic', `❌ Diagnóstico falhou: ${err.message}`, 'warn'))

        continue
      }

      const meta = {
        original: video.path,
        duration: video.duration
      }

      logStep('preview', null, 'groupCollapsed')

      try {
        const res = await fetch(buildSmartPreviewUrl(meta.original, meta.duration), { signal })
        const { start } = await res.json()

        if (signal.aborted) {
          logStep('preview', null, 'end')
          return
        }

        meta.sceneStart = start ?? DEFAULT_SCENE_START
        meta.start = getRandomizedStart(meta)

        const previewUrl = buildPreviewUrl(meta.original, meta.start)

        logStep('preview', {
          name: video.name,
          sceneStart: meta.sceneStart,
          chosenStart: meta.start,
          smartPreviewURL: buildSmartPreviewUrl(meta.original, meta.duration),
          finalPreviewURL: previewUrl
        }, 'info')

        logStep('preview', `🎬 Preview usado: ${video.name} → start=${meta.start}`, 'info')
        bindVideoToSlot(slot, previewUrl, taskKey, meta)
      } catch (err) {
        logStep('preview', `⚠️ smart-preview falhou. Usando fallback: ${err.message}`, 'warn')

        meta.sceneStart = DEFAULT_SCENE_START
        meta.start = getRandomizedStart(meta)

        const previewUrl = buildPreviewUrl(meta.original, meta.start)

        logStep('preview', {
          name: video.name,
          fallback: true,
          sceneStart: meta.sceneStart,
          chosenStart: meta.start,
          finalPreviewURL: previewUrl
        }, 'info')

        logStep('preview', `🎬 Fallback usado: ${video.name} → start=${meta.start}`, 'info')
        bindVideoToSlot(slot, previewUrl, taskKey, meta)
      }

      logStep('preview', null, 'end')
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      logStep('load', '🛑 Carregamento abortado', 'warn')
    } else {
      logStep('load', err, 'error')
      showNotification('Erro ao carregar vídeos', 'error')
    }
  } finally {
    try {
      await fetch('/lock', { method: 'DELETE' })
      logStep('lock', '🔓 Lock liberado após previews', 'info')
    } catch (err) {
      logStep('lock', `⚠️ Falha ao liberar lock: ${err.message}`, 'warn')
    }
  }
}

function createSlotsIfNeeded() {
  if (!gallery) {
    logStep('slots', '❌ #gallery não encontrado', 'error')
    return
  }

  gallery.innerHTML = ''

  for (let i = 0; i < DEFAULT_SLOT_COUNT; i++) {
    const slot = document.createElement('div')
    slot.id = `slot-${i}`
    slot.className =
      'slot video-card relative bg-black rounded overflow-hidden h-60 flex items-center justify-center loading'

    const video = document.createElement('video')
    video.className = 'w-full h-full object-cover rounded shadow pointer-events-none'
    video.muted = true
    video.loop = true
    video.autoplay = true
    video.playsInline = true
    video.preload = 'metadata'

    const loader = document.createElement('div')
    loader.className =
      'absolute inset-0 bg-gray-700 animate-pulse rounded pointer-events-none z-10'

    slot.appendChild(video)
    slot.appendChild(loader)
    gallery.appendChild(slot)
  }

  for (const slot of gallery.children) {
    const video = slot.querySelector('video')
    if (video) {
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }

  logStep('slots', `🎨 ${DEFAULT_SLOT_COUNT} slots criados`, 'info')
}

function bindVideoToSlot(slot, videoUrl, taskKey, videoData) {
  if (!slot) return logStep('bind', '❌ Slot ausente', 'error')

  const videoElem = slot.querySelector('video')
  if (!videoElem) return logStep('bind', '❌ <video> ausente', 'error')

  slot.dataset.meta = JSON.stringify(videoData)

  slot.classList.add('loading')
  videoElem.dataset.meta = JSON.stringify(videoData)

  const removeLoader = () => {
    slot.classList.remove('loading')
    const loader = slot.querySelector('.animate-pulse')
    if (loader) slot.removeChild(loader)
  }

  videoElem.addEventListener(
    'loadeddata',
    () => {
      removeLoader()
      videoElem.currentTime = 0.01
      videoElem
        .play()
        .then(() => logStep('autoplay', `▶️ OK: ${videoData.original}`, 'info'))
        .catch(err => logStep('autoplay', `❌ falhou: ${err.message}`, 'error'))
    },
    { once: true }
  )

  videoElem.addEventListener(
    'error',
    () => {
      removeLoader()
      logStep('preview', `❌ Erro ao carregar preview: ${videoData.original}`, 'warn')
    },
    { once: true }
  )

  videoElem.src = videoUrl
  videoElem.load()
}

export async function reloadVideoWithNewStart(videoElem, video) {
  const taskKey = `reload-${video.original}`
  cancelTask(taskKey)
  const controller = createKillableTask(taskKey)
  const { signal } = controller

  if (!video?.original || !video?.duration) {
    logStep('reload', '❌ Dados inválidos para vídeo', 'error')
    logStep('reload', video, 'error')
    return
  }

  const duration = video.duration
  logStep('reload', { video: video.original, duration }, 'info')

  let newStart = null

  try {
    const res = await fetch(buildSmartPreviewUrl(video.original, duration), { signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (signal.aborted) return

    const sceneStart = data.start
    if (typeof sceneStart !== 'number') throw new Error('Resposta inválida: start ausente')

    video.sceneStart = sceneStart
    newStart = getRandomizedStart(video)

    logStep('reload', `🎯 Novo start: ${video.original} → ${newStart}`, 'info')
    showNotification('🎯 Trecho com mudança de cena detectado', 'info')
  } catch (err) {
    if (err.name !== 'AbortError') {
      logStep('reload', `⚠️ Erro: ${err.message}`, 'warn')
      showNotification('🔁 Cena aleatória usada', 'info')
    }

    video.sceneStart = DEFAULT_SCENE_START
    newStart = getRandomizedStart(video)
    logStep('reload', `🔁 Fallback usado: ${video.original} → ${newStart}`, 'info')
  }

  video.start = newStart
  const newUrl = buildPreviewUrl(video.original, newStart)

  const slot = videoElem.closest('.video-card') || videoElem.closest('.slot')
  if (slot) slot.classList.add('fade-blink')

  bindVideoToSlot(slot, newUrl, taskKey, video)

  if (slot) slot.classList.remove('fade-blink')
}

export async function handleVideoAction(videoPath, start, action) {
  const taskKey = `cut-${videoPath}-${start}`
  cancelTask(taskKey)
  const controller = createKillableTask(taskKey)

  const url = buildCutUrl(videoPath, start, { duration: 10, action })

  try {
    const res = await fetch(url, { method: 'POST', signal: controller.signal })
    const data = await res.json()

    if (!res.ok) {
      logStep('cut', data.message || res.statusText, 'error')
      throw new Error(data.message || 'Erro ao cortar vídeo')
    }

    return data
  } catch (err) {
    if (err.name !== 'AbortError') {
      logStep('cut', `❌ ${err.message}`, 'error')
      showNotification('Erro ao cortar vídeo', 'error')
    }
    throw err
  }
}
