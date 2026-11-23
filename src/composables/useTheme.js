import { ref, watch } from 'vue'

// Tema claro/oscuro compartido (singleton), persistido en localStorage y
// aplicado como clase "dark" en <html> para que todas las variables de
// color en main.css cambien automáticamente.
const THEME_KEY = 'conectatec:theme:v1'

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch { /* localStorage no disponible */ }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

const isDark = ref(getInitialTheme() === 'dark')

function applyTheme(dark) {
  document.documentElement.classList.toggle('dark', dark)
  try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light') } catch { /* no disponible */ }
}

// Aplica el tema inicial en cuanto se carga este módulo
applyTheme(isDark.value)

watch(isDark, (val) => applyTheme(val))

export function useTheme() {
  function toggleTheme() {
    isDark.value = !isDark.value
  }
  return { isDark, toggleTheme }
}
