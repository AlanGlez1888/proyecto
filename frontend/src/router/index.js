import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import HomeView from '../views/HomeView.vue'
import TeacherSearchView from '../views/TeacherSearchView.vue'
import TeacherProfileView from '../views/TeacherProfileView.vue'
import MarketplaceView from '../views/MarketplaceView.vue'
import AdminView from '../views/AdminView.vue'
import ProfileView from '../views/ProfileView.vue'
import FriendsView from '../views/FriendsView.vue'

const routes = [
  // 1. Login y Registro son PÚBLICOS
  { path: '/', name: 'login', component: LoginView },
  { path: '/registro', name: 'register', component: RegisterView },
  
  // 2. Rutas PROTEGIDAS
  { path: '/feed', name: 'home', component: HomeView, meta: { requiresAuth: true } },
  { path: '/maestros', name: 'teacher-search', component: TeacherSearchView, meta: { requiresAuth: true } },
  { path: '/maestros/:id', name: 'teacher-profile', component: TeacherProfileView, props: true, meta: { requiresAuth: true } },
  { path: '/marketplace', name: 'marketplace', component: MarketplaceView, meta: { requiresAuth: true } },
  { path: '/perfil', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/amigos', name: 'friends', component: FriendsView, meta: { requiresAuth: true } },

  // 3. Ruta exclusiva para Moderador y Administrador
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: { requiresAuth: true, roles: ['administrador', 'moderador'] }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token')
  const isAuthenticated = token !== null

  let rol = 'alumno'
  try {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}')
    rol = (user.rol || user.Rol || 'alumno').toLowerCase()
  } catch (e) {
    rol = 'alumno'
  }

  // 1. Si requiere autenticación y NO hay token -> al login
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  }
  // 2. Si la ruta pide roles específicos y el usuario no lo tiene -> al feed
  else if (to.meta.roles && !to.meta.roles.includes(rol)) {
    next({ name: 'home' })
  }
  // 3. Si ya tiene sesión abierta e intenta ir al login o registro
  else if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    if (rol === 'administrador' || rol === 'moderador') {
      next({ name: 'admin' })
    } else {
      next({ name: 'home' })
    }
  }
  // 4. Cualquier otro caso -> dejar pasar
  else {
    next()
  }
})

export default router