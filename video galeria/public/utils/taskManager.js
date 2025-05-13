import { logStep } from './logger.js'

const tasks = new Map()

export function createKillableTask(taskKey) {
  const controller = new AbortController()
  tasks.set(taskKey, controller)
  return controller
}

export function cancelTask(taskKey) {
  const ctrl = tasks.get(taskKey)
  if (ctrl) {
    ctrl.abort()
    tasks.delete(taskKey)
  } else {
    logStep('task', `Tarefa inexistente cancelada: ${taskKey}`, 'warn')
  }
}

export function cancelAllTasks() {
  for (const [taskKey, ctrl] of tasks.entries()) {
    ctrl.abort()
    logStep('task', `Cancelada via cancelAll: ${taskKey}`, 'warn')
  }
  tasks.clear()
}
