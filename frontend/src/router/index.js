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
  { path: '/', name: 'login', component: LoginView, meta: { auth: true } },
  { path: '/registro', name: 'register', component: RegisterView, meta: { auth: true } },
  { path: '/feed', name: 'home', component: HomeView },
  { path: '/maestros', name: 'teacher-search', component: TeacherSearchView },
  { path: '/maestros/:id', name: 'teacher-profile', component: TeacherProfileView, props: true },
  { path: '/marketplace', name: 'marketplace', component: MarketplaceView },
  { path: '/admin', name: 'admin', component: AdminView },
  { path: '/perfil', name: 'profile', component: ProfileView },
  { path: '/amigos', name: 'friends', component: FriendsView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
