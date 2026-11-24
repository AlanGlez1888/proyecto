<template>
  <article class="post" :class="{ highlighted }" :style="{ '--accent': accentColor }">
    <div class="post-bar"></div>
    <div class="post-body">
      <div class="post-top">
        <div class="who">
          <span class="avatar" :style="{ background: accentColor }">{{ avatarInitials }}</span>
          <span class="who-text">
            <span class="teacher">{{ post.teacher }}</span>
            <span class="dot-sep">·</span>
            <span class="subject">{{ post.subject }}</span>
          </span>
        </div>
        <RatingStars :rating="post.rating" />
      </div>

      <p class="content">{{ post.content }}</p>

      <div class="post-footer">
        <span class="author">{{ post.anonymous ? 'Publicado de forma anónima' : post.author }}</span>
        <div class="footer-actions">
          <button class="like" :class="{ pulsing }" type="button" @click="onLike">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 9v9H4a1 1 0 01-1-1v-7a1 1 0 011-1h3zm0 0l3.5-6a2 2 0 013.8.9L13.5 8H16a2 2 0 012 2.2l-1.1 6A2 2 0 0114.9 18H7" />
            </svg>
            Útil <span class="count">{{ post.likes ?? 0 }}</span>
          </button>

          <button
            v-if="canReport"
            type="button"
            class="btn-report-post"
            :disabled="reporting"
            @click="onReport"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 3v14M4 4h10l-1.5 3.5L14 11H4" />
            </svg>
            {{ reporting ? 'Enviando...' : 'Reportar' }}
          </button>

          <button
            v-if="canDelete"
            type="button"
            class="btn-delete-post"
            @click="$emit('delete', post.id)"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'
import RatingStars from './RatingStars.vue'
import { colorForSubject, initialsFor } from '../utils/subjectColor.js'

const props = defineProps({
  post: { type: Object, required: true },
  highlighted: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  canReport: { type: Boolean, default: true }
})

defineEmits(['delete'])

const accentColor = computed(() => colorForSubject(props.post.subject))
const avatarInitials = computed(() => (props.post.anonymous ? '?' : initialsFor(props.post.author)))

const pulsing = ref(false)
const reporting = ref(false)

function onLike() {
  props.post.likes = (props.post.likes ?? 0) + 1
  pulsing.value = true
  setTimeout(() => { pulsing.value = false }, 320)
}

async function onReport() {
  const motivo = prompt('¿Por qué deseas reportar esta reseña? (Ej. Lenguaje ofensivo, spam, información falsa)')
  if (!motivo || !motivo.trim()) return

  const token = sessionStorage.getItem('token')
  if (!token) {
    alert('Debes iniciar sesión para reportar contenido.')
    return
  }

  reporting.value = true
  try {
    const response = await fetch('http://localhost:3000/api/admin/reportes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        id_resena: props.post.id,
        motivo: motivo.trim()
      })
    })

    const data = await response.json()
    alert(data.message || 'Reporte enviado correctamente.')
  } catch (error) {
    console.error('Error al reportar reseña:', error)
    alert('Error de conexión con el servidor.')
  } finally {
    reporting.value = false
  }
}
</script>

<style scoped>
.post {
  display: flex;
  gap: 1rem;
  padding: 1.1rem 0.6rem 1.1rem 0.4rem;
  margin: 0 -0.6rem 0 -0.4rem;
  border-bottom: 1px solid var(--line);
  border-radius: 8px;
}
.post.highlighted { animation: glow 1.6s ease; }
@keyframes glow {
  0% { background: rgba(79, 195, 247, 0.22); }
  100% { background: transparent; }
}
.post-bar { flex: none; width: 3px; border-radius: 2px; background: var(--accent); }
.post-body { flex: 1; min-width: 0; }
.post-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 0.5rem; }
.who { display: flex; align-items: center; gap: 0.6rem; }
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.7rem;
  flex: none;
}
.who-text { font-size: 0.95rem; color: var(--ink); }
.teacher { font-weight: 600; }
.dot-sep { margin: 0 0.4rem; color: var(--slate-light); }
.subject { color: var(--accent); font-weight: 500; }
.content { margin: 0.3rem 0 0.6rem; color: var(--ink); max-width: 62ch; }
.post-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; }
.author { font-size: 0.8rem; color: var(--slate); }
.footer-actions { display: flex; align-items: center; gap: 0.5rem; }

.like,
.btn-report-post {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: none;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.3rem 0.75rem;
  font-size: 0.78rem;
  color: var(--slate);
  cursor: pointer;
  font-family: var(--font-body);
  transition: border-color 0.15s ease, color 0.15s ease;
}
.like svg,
.btn-report-post svg { width: 13px; height: 13px; }
.like:hover { border-color: var(--blue-500); color: var(--blue-500); }
.like.pulsing { animation: pulse 0.32s ease; border-color: var(--blue-500); color: var(--blue-500); }

.btn-report-post:hover:not(:disabled) {
  border-color: #d97706;
  color: #d97706;
}
.btn-report-post:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-delete-post {
  background: transparent;
  border: 1px solid #dc3545;
  color: #dc3545;
  border-radius: 999px;
  padding: 0.3rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-body);
  transition: all 0.15s ease;
}
.btn-delete-post:hover {
  background: #dc3545;
  color: white;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}
.count { font-weight: 700; }
</style>