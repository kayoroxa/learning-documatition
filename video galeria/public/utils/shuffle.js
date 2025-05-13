import { logStep } from './logger.js'

export function shuffle(array) {
  if (!Array.isArray(array)) {
    logStep('shuffle', '⚠️ Valor passado não é array', 'error')
    logStep('shuffle', array, 'error')
    return []
  }

  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  return copy
}
