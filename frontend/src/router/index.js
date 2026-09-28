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
  // 1. Login y Registro son PÚBLICOS (NO llevan meta)
  { path: '/', name: 'login', component: LoginView },
  { path: '/registro', name: 'register', component: RegisterView },
  
  // 2. Rutas PROTEGIDAS (llevan requiresAuth: true)
  { path: '/feed', name: 'home', component: HomeView, meta: { requiresAuth: true } },
  { path: '/maestros', name: 'teacher-search', component: TeacherSearchView, meta: { requiresAuth: true } },
  { path: '/maestros/:id', name: 'teacher-profile', component: TeacherProfileView, props: true, meta: { requiresAuth: true } },
  { path: '/marketplace', name: 'marketplace', component: MarketplaceView, meta: { requiresAuth: true } },
  { path: '/admin', name: 'admin', component: AdminView, meta: { requiresAuth: true } },
  { path: '/perfil', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/amigos', name: 'friends', component: FriendsView, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = sessionStorage.getItem('token') !== null;

  // Si requiere autenticación y NO hay token, lo mandamos al login
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' }); // <-- Corregido con comillas
  }
  // Si ya tiene sesión abierta e intenta ir al login o registro, lo mandamos al feed (home)
  else if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    next({ name: 'home' });
  }
  // En cualquier otro caso, lo dejamos pasar
  else {
    next();
  }
});

export default router;