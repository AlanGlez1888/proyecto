import { reactive } from 'vue'

// Estado compartido (singleton) para mostrar notificaciones flotantes
// desde cualquier componente sin necesidad de una librería externa.
const toasts = reactive([])
let uid = 0

export function useToast() {
  function show(message, type = 'success') {
    const id = ++uid
    toasts.push({ id, message, type })
    setTimeout(() => {
      const idx = toasts.findIndex(t => t.id === id)
      if (idx !== -1) toasts.splice(idx, 1)
    }, 3000)
  }
  return { toasts, show }
}
