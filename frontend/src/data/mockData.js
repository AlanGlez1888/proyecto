import { reactive } from 'vue'

// Estado compartido de la app (mock, en memoria).
// Cuando exista el backend, esto se reemplaza por llamadas a la API.

export const teachers = reactive([
  { id: 1, name: 'Ing. Juan Pérez', subject: 'Programación Web', rating: 5 },
  { id: 2, name: 'Lic. Ana Ruiz', subject: 'Administración de Proyectos', rating: 3 },
  { id: 3, name: 'Ing. Marco Salas', subject: 'Bases de Datos', rating: 4 }
])

export const posts = reactive([
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
])

export const friends = reactive([
  { id: 1, name: 'Karla M.', career: 'Ing. en TICs', online: true },
  { id: 2, name: 'Diego T.', career: 'Ing. en Sistemas', online: false },
  { id: 3, name: 'Renata P.', career: 'Ing. en TICs', online: true },
  { id: 4, name: 'Luis Esparza', career: 'Ing. en TICs', online: false },
  { id: 5, name: 'Miguel Palacio', career: 'Ing. en TICs', online: true }
])

export const chats = reactive([
  { id: 1, name: 'Karla M.', preview: '¿Ya viste la guía de BD?', unread: 2 },
  { id: 2, name: 'Grupo TICs 6A', preview: 'Diego: subí mis apuntes', unread: 0 }
])

export const marketplaceItems = reactive([
  { id: 1, title: 'Libro de Cálculo Diferencial', subject: 'Cálculo', condition: 'Buen estado', type: 'venta', price: 150, seller: 'Diego T.' },
  { id: 2, title: 'Guía Bases de Datos parcial 2', subject: 'Bases de Datos', condition: 'Nuevo', type: 'venta', price: 60, seller: 'Karla M.' },
  { id: 3, title: 'Calculadora científica', subject: 'General', condition: 'Usada', type: 'renta', price: 0, seller: 'Renata P.' },
  { id: 4, title: 'Notas de Administración de Proyectos', subject: 'Administración de Proyectos', condition: 'Buen estado', type: 'venta', price: 40, seller: 'Alan González' }
])
