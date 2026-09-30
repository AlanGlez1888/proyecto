import { reactive, watch } from 'vue'

// Estado compartido de la app (mock). Los maestros/amigos/chats son fijos;
// las opiniones y artículos del marketplace se guardan en localStorage para
// que sobrevivan a un refresh mientras no hay backend.

export const teachers = reactive([
  { id: 1, name: 'Ing. Juan Pérez', subject: 'Programación Web', rating: 5 },
  { id: 2, name: 'Lic. Ana Ruiz', subject: 'Administración de Proyectos', rating: 3 },
  { id: 3, name: 'Ing. Marco Salas', subject: 'Bases de Datos', rating: 4 }
])

export const friends = reactive([
  { id: 1, name: 'Karla M.', career: 'Ing. en TICs', online: true },
  { id: 2, name: 'Diego T.', career: 'Ing. en Sistemas', online: false },
  { id: 3, name: 'Renata P.', career: 'Ing. en TICs', online: true },
  { id: 4, name: 'Luis Esparza', career: 'Ing. en TICs', online: false },
  { id: 5, name: 'Miguel Palacio', career: 'Ing. en TICs', online: true }
])

const DEFAULT_CHATS = [
  {
    id: 1,
    name: 'Karla M.',
    unread: 2,
    messages: [
      { id: 1, from: 'them', text: 'Hola, ¿cómo te fue en el parcial de BD?', time: '09:40' },
      { id: 2, from: 'me', text: 'Bien, aunque la última pregunta estuvo dura', time: '09:42' },
      { id: 3, from: 'them', text: 'Oye, ¿ya viste la guía que subieron?', time: '10:02' },
      { id: 4, from: 'them', text: '¿Ya viste la guía de BD?', time: '10:03' }
    ]
  },
  {
    id: 2,
    name: 'Grupo TICs 6A',
    unread: 0,
    messages: [
      { id: 1, from: 'them', text: 'Miguel: ¿a qué hora es la exposición del viernes?', time: '08:15' },
      { id: 2, from: 'them', text: 'Diego: subí mis apuntes de Administración de Proyectos', time: '09:20' }
    ]
  }
]

const CHATS_KEY = 'conectatec:chats:v1'

const DEFAULT_POSTS = [
  {
    id: 1,
    author: 'Karla M.',
    anonymous: false,
    teacher: 'Ing. Juan Pérez',
    subject: 'Programación Web',
    content: 'Explica muy claro y responde dudas fuera de clase. Recomendado si vas empezando con desarrollo web.',
    rating: 5,
    likes: 12
  },
  {
    id: 2,
    author: '',
    anonymous: true,
    teacher: 'Lic. Ana Ruiz',
    subject: 'Administración de Proyectos',
    content: 'Las entregas se acumulan mucho al final del semestre, conviene ir organizando el trabajo desde antes.',
    rating: 3,
    likes: 4
  },
  {
    id: 3,
    author: 'Diego T.',
    anonymous: false,
    teacher: 'Ing. Marco Salas',
    subject: 'Bases de Datos',
    content: 'Buen manejo de ejemplos prácticos en clase, pero el examen final es bastante pesado.',
    rating: 4,
    likes: 7
  },
  {
    id: 4,
    author: 'Alan González',
    anonymous: false,
    teacher: 'Ing. Juan Pérez',
    subject: 'Programación Web',
    content: 'Coincido, además sube grabaciones de las clases por si faltas.',
    rating: 5,
    likes: 2
  }
]

const DEFAULT_MARKETPLACE_ITEMS = [
  { id: 1, title: 'Libro de Cálculo Diferencial', subject: 'Cálculo', condition: 'Buen estado', type: 'venta', price: 150, seller: 'Diego T.' },
  { id: 2, title: 'Guía Bases de Datos parcial 2', subject: 'Bases de Datos', condition: 'Nuevo', type: 'venta', price: 60, seller: 'Karla M.' },
  { id: 3, title: 'Calculadora científica', subject: 'General', condition: 'Usada', type: 'renta', price: 0, seller: 'Renata P.' },
  { id: 4, title: 'Notas de Administración de Proyectos', subject: 'Administración de Proyectos', condition: 'Buen estado', type: 'venta', price: 40, seller: 'Alan González' }
]

const POSTS_KEY = 'conectatec:posts:v1'
const MARKET_KEY = 'conectatec:marketplace:v1'

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length ? parsed : fallback
  } catch {
    return fallback
  }
}

export const posts = reactive(loadFromStorage(POSTS_KEY, DEFAULT_POSTS))
export const marketplaceItems = reactive(loadFromStorage(MARKET_KEY, DEFAULT_MARKETPLACE_ITEMS))
export const chats = reactive(loadFromStorage(CHATS_KEY, DEFAULT_CHATS))

watch(posts, (val) => {
  try { localStorage.setItem(POSTS_KEY, JSON.stringify(val)) } catch { /* almacenamiento no disponible */ }
}, { deep: true })

watch(marketplaceItems, (val) => {
  try { localStorage.setItem(MARKET_KEY, JSON.stringify(val)) } catch { /* almacenamiento no disponible */ }
}, { deep: true })

watch(chats, (val) => {
  try { localStorage.setItem(CHATS_KEY, JSON.stringify(val)) } catch { /* almacenamiento no disponible */ }
}, { deep: true })
