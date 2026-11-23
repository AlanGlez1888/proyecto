import { reactive } from 'vue'

// Estado compartido de la barra de progreso superior, controlada desde
// las guardias de navegación del router.
export const progress = reactive({ state: 'idle' }) // idle | loading | done

let idleTimer = null

export function startProgress() {
  clearTimeout(idleTimer)
  progress.state = 'loading'
}

export function finishProgress() {
  progress.state = 'done'
  idleTimer = setTimeout(() => { progress.state = 'idle' }, 220)
}
