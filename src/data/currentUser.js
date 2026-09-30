import { reactive, watch } from 'vue'

// Datos del usuario logueado (mock). Se guardan en localStorage para que
// los cambios de perfil sobrevivan a un refresh mientras no hay backend.
const USER_KEY = 'conectatec:current-user:v1'

const DEFAULT_USER = {
  name: 'Alan González',
  career: 'Ingeniería en Tecnologías de la Información y Comunicaciones',
  semester: 6,
  email: 'alan.gonzalez@alumno.tecnm.mx',
  // 'estudiante', 'moderador' o 'admin' — cambia esto para probar
  // cómo se ve la app con cada rol.
  role: 'estudiante'
}

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? { ...DEFAULT_USER, ...JSON.parse(raw) } : { ...DEFAULT_USER }
  } catch {
    return { ...DEFAULT_USER }
  }
}

export const currentUser = reactive(loadUser())

watch(currentUser, (val) => {
  try { localStorage.setItem(USER_KEY, JSON.stringify(val)) } catch { /* almacenamiento no disponible */ }
}, { deep: true })
