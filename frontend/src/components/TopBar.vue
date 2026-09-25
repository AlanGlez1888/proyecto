<template>
  <header class="topbar">
    <router-link to="/feed" class="brand">
      <AppLogo :size="30" />
    </router-link>

    <div class="search-wrap">
      <form class="search" @submit.prevent="onSearch">
        <input
          v-model="q"
          type="text"
          placeholder="Buscar maestros o amigos"
          @focus="focused = true"
          @blur="onBlur"
        />
      </form>
      <div v-if="showDropdown" class="dropdown">
        <div v-if="teacherMatches.length" class="group">
          <span class="group-title">Maestros</span>
          <button
            v-for="t in teacherMatches" :key="'t' + t.id"
            type="button" class="result" @mousedown.prevent="goTeacher(t)"
          >
            <span class="dot" :style="{ background: colorForSubject(t.subject) }"></span>
            {{ t.name }} <em>· {{ t.subject }}</em>
          </button>
        </div>
        <div v-if="friendMatches.length" class="group">
          <span class="group-title">Amigos</span>
          <button
            v-for="f in friendMatches" :key="'f' + f.id"
            type="button" class="result" @mousedown.prevent="goFriend(f)"
          >
            <span class="dot friend"></span>
            {{ f.name }}
          </button>
        </div>
      </div>
    </div>

    <div class="right-controls">
      <div class="notif-wrap" ref="notifWrapEl">
        <button class="bell" type="button" @click.stop="toggleNotifs">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 3a4 4 0 00-4 4v3l-1.5 3h11L14 10V7a4 4 0 00-4-4zM8.5 17a1.5 1.5 0 003 0" />
          </svg>
          <span v-if="notifications.length" class="bell-badge">{{ notifications.length }}</span>
        </button>
        <div v-if="showNotifs" class="notif-dropdown">
          <p v-for="n in notifications" :key="n.id" class="notif-item">{{ n.text }}</p>
          <p v-if="notifications.length === 0" class="notif-empty">No tienes notificaciones nuevas.</p>
        </div>
      </div>

      <router-link to="/perfil" class="avatar">{{ initials }}</router-link>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { currentUser } from '../data/currentUser.js'
import { teachers, friends } from '../data/mockData.js'
import { initialsFor, colorForSubject } from '../utils/subjectColor.js'
import AppLogo from './AppLogo.vue'

const q = ref('')
const focused = ref(false)
const router = useRouter()

const initials = computed(() => initialsFor(currentUser.name))

const teacherMatches = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return []
  return teachers.filter(t => t.name.toLowerCase().includes(s)).slice(0, 4)
})

const friendMatches = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return []
  return friends.filter(f => f.name.toLowerCase().includes(s)).slice(0, 4)
})

const showDropdown = computed(
  () => focused.value && q.value.trim() !== '' && (teacherMatches.value.length || friendMatches.value.length)
)

function goTeacher(t) {
  q.value = ''
  focused.value = false
  router.push(`/maestros/${t.id}`)
}

function goFriend(f) {
  q.value = ''
  focused.value = false
  router.push({ name: 'friends', query: { q: f.name } })
}

function onSearch() {
  if (!q.value.trim()) return
  router.push({ name: 'teacher-search', query: { q: q.value } })
  focused.value = false
}

function onBlur() {
  setTimeout(() => { focused.value = false }, 150)
}

// Notificaciones (mock)
const notifications = ref([
  { id: 1, text: 'Karla comentó algo parecido en Ing. Juan Pérez' },
  { id: 2, text: 'Alguien está interesado en tu artículo del marketplace' }
])
const showNotifs = ref(false)
const notifWrapEl = ref(null)

function toggleNotifs() { showNotifs.value = !showNotifs.value }
function handleDocClick(e) {
  if (notifWrapEl.value && !notifWrapEl.value.contains(e.target)) showNotifs.value = false
}
onMounted(() => document.addEventListener('click', handleDocClick))
onUnmounted(() => document.removeEventListener('click', handleDocClick))
</script>

<style scoped>
.topbar {
  display: grid;
  grid-template-columns: auto minmax(0, 480px) auto;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 0.7rem 1.5rem;
  background: var(--navy);
  border-bottom: 2px solid transparent;
  border-image: linear-gradient(90deg, var(--blue-300), var(--blue-500)) 1;
}
.brand { text-decoration: none; display: flex; align-items: center; }
.search-wrap { position: relative; width: 100%; }
.search input {
  width: 100%;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.12);
  color: white;
  font-family: var(--font-body);
  font-size: 0.9rem;
}
.search input::placeholder { color: rgba(255, 255, 255, 0.6); }
.search input:focus {
  outline: 2px solid var(--blue-300);
  background: rgba(255, 255, 255, 0.18);
}
.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--white);
  border-radius: 10px;
  box-shadow: 0 14px 32px rgba(13, 27, 62, 0.22);
  padding: 0.5rem;
  z-index: 20;
  text-align: left;
}
.group { margin-bottom: 0.35rem; }
.group:last-child { margin-bottom: 0; }
.group-title {
  display: block;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--slate-light);
  padding: 0.3rem 0.5rem;
}
.result {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  padding: 0.45rem 0.5rem;
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--ink);
  cursor: pointer;
  font-family: var(--font-body);
}
.result:hover { background: var(--paper); }
.dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }
.dot.friend { background: var(--blue-500); }
.result em { font-style: normal; color: var(--slate); }

.right-controls { display: flex; align-items: center; gap: 1rem; justify-self: end; }

.notif-wrap { position: relative; }
.bell {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.bell:hover { background: rgba(255, 255, 255, 0.18); }
.bell svg { width: 18px; height: 18px; }
.bell-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--amber);
  color: white;
  font-size: 0.62rem;
  font-weight: 700;
  border-radius: 999px;
  min-width: 15px;
  height: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
}
.notif-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 260px;
  background: var(--white);
  border-radius: 10px;
  box-shadow: 0 14px 32px rgba(13, 27, 62, 0.22);
  padding: 0.75rem;
  z-index: 20;
}
.notif-item {
  font-size: 0.82rem;
  color: var(--ink);
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--line);
  margin: 0;
}
.notif-item:last-child { border-bottom: none; }
.notif-empty { font-size: 0.82rem; color: var(--slate); margin: 0; }

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--blue-500);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.85rem;
  text-decoration: none;
  flex: none;
}
</style>
