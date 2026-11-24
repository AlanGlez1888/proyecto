<template>
  <section class="page">
    <p v-if="loading" class="empty">Cargando perfil del maestro...</p>

    <template v-else-if="teacher">
      <header class="header">
        <span class="badge" :style="{ background: colorForSubject(teacher.subject) }">
          {{ initialsFor(teacher.name) }}
        </span>
        <div>
          <h1>{{ teacher.name }}</h1>
          <p class="subject" :style="{ color: colorForSubject(teacher.subject) }">{{ teacher.subject }}</p>
          <RatingStars :rating="Number(teacher.rating)" />
        </div>
      </header>

      <h2>Comentarios</h2>
      <div class="feed">
        <PostCard v-for="post in comments" :key="post.id" :post="post" />
        <EmptyState v-if="comments.length === 0" message="Aún no hay comentarios sobre este maestro." />
      </div>
    </template>

    <EmptyState v-else message="No encontramos a este maestro." />
  </section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import RatingStars from '../components/RatingStars.vue'
import PostCard from '../components/PostCard.vue'
import EmptyState from '../components/EmptyState.vue'
import { colorForSubject, initialsFor } from '../utils/subjectColor.js'

const props = defineProps({ id: String })

const teacher = ref(null)
const comments = ref([])
const loading = ref(true)

async function fetchMaestroDetalle(id) {
  loading.value = true
  try {
    const response = await fetch(`http://localhost:3000/api/resenas/maestros/${id}`)
    if (!response.ok) throw new Error('Maestro no encontrado')
    const data = await response.json()
    teacher.value = data.teacher
    comments.value = data.comments
  } catch (error) {
    console.error('Error al cargar detalle del maestro:', error)
    teacher.value = null
    comments.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchMaestroDetalle(props.id))

// Por si cambias de un maestro a otro sin salir de la vista
watch(() => props.id, (newId) => {
  if (newId) fetchMaestroDetalle(newId)
})
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--line);
}
.badge {
  flex: none;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.3rem;
}
.subject { margin: 0.2rem 0 0.4rem; font-weight: 500; }
.empty { color: var(--slate); margin-top: 1rem; }
</style>