import { ref } from 'vue'

// Racha simple de días distintos en los que el usuario ha entrado a la app,
// guardada en localStorage. Sube si entras el día siguiente al último
// registrado, se reinicia si dejas pasar más de un día.
const STREAK_KEY = 'conectatec:streak:v1'

export function useStreak() {
  const streak = ref(1)

  try {
    const today = new Date().toISOString().slice(0, 10)
    const raw = localStorage.getItem(STREAK_KEY)

    if (!raw) {
      localStorage.setItem(STREAK_KEY, JSON.stringify({ lastDate: today, count: 1 }))
    } else {
      const data = JSON.parse(raw)
      if (data.lastDate === today) {
        streak.value = data.count
      } else {
        const diffDays = Math.round((new Date(today) - new Date(data.lastDate)) / 86400000)
        streak.value = diffDays === 1 ? data.count + 1 : 1
        localStorage.setItem(STREAK_KEY, JSON.stringify({ lastDate: today, count: streak.value }))
      }
    }
  } catch {
    // almacenamiento no disponible, se queda en 1 sin romper la app
  }

  return { streak }
}
