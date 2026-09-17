import { reactive } from 'vue'

// Datos de ejemplo del usuario logueado (mock, reactivo).
// Cuando exista el backend, esto vendrá de la sesión/API real.
export const currentUser = reactive({
  name: 'Alan González',
  career: 'Ingeniería en Tecnologías de la Información y Comunicaciones',
  semester: 6,
  email: 'alan.gonzalez@alumno.tecnm.mx',
  // 'estudiante', 'moderador' o 'admin' — cambia esto para probar
  // cómo se ve la app con cada rol.
  role: 'estudiante'
})
