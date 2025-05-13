import { logStep } from './logger.js'

/**
 * Monta uma URL de preview de vídeo.
 * 
 * @param {string} path - Caminho original do vídeo.
 * @param {number} start - Tempo inicial do preview.
 * @param {object} [options] - Opções adicionais como duração.
 * @param {number} [options.duration=10] - Duração do preview em segundos.
 * @returns {string} URL final para o preview.
 */
export function buildPreviewUrl(path, start, options = {}) {
  if (!path || typeof path !== 'string') {
    logStep('buildPreviewUrl', '⚠️ path inválido', 'error')
    logStep('buildPreviewUrl', path, 'error')
    throw new Error('path inválido')
  }

  if (typeof start !== 'number' || isNaN(start)) {
    logStep('buildPreviewUrl', '⚠️ start inválido', 'error')
    logStep('buildPreviewUrl', start, 'error')
    throw new Error('start inválido')
  }

  const duration = options.duration ?? 10
  const encodedPath = encodeURIComponent(path)
  return `/preview?path=${encodedPath}&start=${start}&duration=${duration}`
}

/**
 * Monta a URL para smart-preview (início sugerido via cache).
 * 
 * @param {string} path - Caminho original do vídeo.
 * @param {number} duration - Duração total do vídeo.
 * @returns {string} URL para smart-preview.
 */
export function buildSmartPreviewUrl(path, duration) {
  if (!path || typeof path !== 'string') {
    logStep('buildSmartPreviewUrl', '⚠️ path inválido', 'error')
    logStep('buildSmartPreviewUrl', path, 'error')
    throw new Error('path inválido')
  }

  const encodedPath = encodeURIComponent(path)
  return `/smart-preview?path=${encodedPath}&duration=${duration}`
}

/**
 * Monta a URL para cortar trecho de vídeo.
 * 
 * @param {string} path - Caminho do vídeo original.
 * @param {number} start - Ponto de início do corte.
 * @param {object} [options] - Opções como duração e ação.
 * @param {number} [options.duration=10] - Duração do trecho.
 * @param {string} [options.action] - Ação específica a ser passada na query.
 * @returns {string} URL do corte.
 */
export function buildCutUrl(path, start, options = {}) {
  if (!path || typeof path !== 'string') {
    logStep('buildCutUrl', '⚠️ path inválido', 'error')
    logStep('buildCutUrl', path, 'error')
    throw new Error('path inválido')
  }

  if (typeof start !== 'number' || isNaN(start)) {
    logStep('buildCutUrl', '⚠️ start inválido', 'error')
    logStep('buildCutUrl', start, 'error')
    throw new Error('start inválido')
  }

  const encodedPath = encodeURIComponent(path)
  const duration = options.duration ?? 10
  const action = options.action ? `&action=${encodeURIComponent(options.action)}` : ''
  return `/cut?path=${encodedPath}&start=${start}&clipDuration=${duration}${action}`
}

/**
 * Monta a URL para listagem de vídeos de uma pasta.
 * 
 * @param {string} folder - Nome da pasta.
 * @returns {string} URL de listagem de vídeos.
 */
export function buildVideosUrl(folder) {
  if (!folder || typeof folder !== 'string') {
    logStep('buildVideosUrl', '⚠️ folder inválido', 'error')
    logStep('buildVideosUrl', folder, 'error')
    throw new Error('folder inválido')
  }

  const encoded = encodeURIComponent(folder)
  return `/videos?folder=${encoded}`
}

/**
 * Monta a URL de lock com motivo.
 * 
 * @param {string} [reason='manual'] - Motivo do bloqueio.
 * @returns {string} URL com motivo codificado.
 */
export function buildLockUrl(reason = 'manual') {
  const encoded = encodeURIComponent(reason)
  return `/lock?reason=${encoded}`
}

// URL fixa para lista de pastas
export const FOLDERS_URL = '/folders'
