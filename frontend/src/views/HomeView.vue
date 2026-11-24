<template>
  <section class="page">
    <header class="intro">
      <h1>Lo que dicen tus compañeros</h1>
      <p class="lede">
        Opiniones reales sobre maestros del Tec, para que elijas tus materias con
        más información antes de cargar horario.
      </p>
    </header>

    <div class="spotlight" v-if="spotlightTeacher">
      <span class="spotlight-tag">Maestro más recomendado</span>
      <div class="spotlight-body">
        <span class="spotlight-avatar" :style="{ background: colorForSubject(spotlightTeacher.subject) }">
          {{ initialsFor(spotlightTeacher.name) }}
        </span>
        <div class="spotlight-info">
          <span class="spotlight-name">{{ spotlightTeacher.name }}</span>
          <span class="spotlight-subject">{{ spotlightTeacher.subject }}</span>
        </div>
        <RatingStars :rating="spotlightTeacher.rating" />
        <router-link :to="`/maestros/${spotlightTeacher.id}`" class="spotlight-link">Ver perfil →</router-link>
      </div>
    </div>

    <div class="composer">
      <div class="composer-top">
        <span class="avatar-sm">{{ initials }}</span>
        <input v-model="draft.content" type="text" placeholder="¿Qué opinas de algún maestro hoy?" />
      </div>

      <div class="composer-fields">
        <!-- Selector dinámico con los datos de laBD -->
        <select v-model="draft.ID_Prof_Mat" class="clase-select">
          <option value="" disabled>Selecciona un maestro y materia</option>
          <option v-for="clase in clasesDisponibles" :key="clase.ID_Prof_Mat" :value="clase.ID_Prof_Mat">
            {{ clase.Nombre_Prof }} {{ clase.APat_Prof }} - {{ clase.Nombre_Mat }}
          </option>
        </select>
        
        <div class="rating-picker">
          <button
            v-for="n in 5" :key="n" type="button"
            class="star-btn" :class="{ active: n <= draft.Puntaje }"
            @click="draft.Puntaje = n"
          >★</button>
        </div>
      </div>

      <div class="composer-actions">
        <!-- El checkbox de anónimo fue removido porque no está en el esquema SQL -->
        <button class="publish" type="button" :disabled="!canPublish" @click="publish">Publicar</button>
      </div>
    </div>

    <div class="searchbar">
      <input v-model="query" type="text" placeholder="Buscar por maestro, materia o carrera" />
    </div>

    <div class="feed">
      <PostCard
        v-for="post in filteredPosts"
        :key="post.id"
        :post="post"
        :highlighted="post.id === justPostedId"
      />
      <EmptyState v-if="filteredPosts.length === 0" message="No hay opiniones que coincidan con tu búsqueda." />
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue' // Agregado onMounted
import PostCard from '../components/PostCard.vue'
import EmptyState from '../components/EmptyState.vue'
import RatingStars from '../components/RatingStars.vue'
// Se eliminó la importación de posts y teachers de mockData.js
import { currentUser } from '../data/currentUser.js'
import { initialsFor, colorForSubject } from '../utils/subjectColor.js'
import { useToast } from '../composables/useToast.js'

const { show } = useToast()

const query = ref('')
const initials = computed(() => initialsFor(currentUser.name))

const posts = ref([])
const clasesDisponibles = ref([])

const spotlightTeacher = computed(() => {
  if (posts.value.length === 0) return null
  const topPost = posts.value.reduce((prev, current) => (prev.rating > current.rating) ? prev : current)
  return {
    name: topPost.teacher,
    subject: topPost.subject,
    rating: topPost.rating
  }
})

// Cambiado 'rating' por 'Puntaje' para coincidir con el v-model del template
const draft = reactive({ content: '', ID_Prof_Mat: '', Puntaje: 0 })

const canPublish = computed(
  () => draft.content.trim() && draft.ID_Prof_Mat && draft.Puntaje > 0
)

const justPostedId = ref(null)

onMounted(async () => {
  try {
    const [resPosts, resClases] = await Promise.all([
      fetch('http://localhost:3000/api/resenas').then(r => {
        if (!r.ok) throw new Error('Error cargando reseñas');
        return r.json();
      }),
      fetch('http://localhost:3000/api/resenas/clases').then(r => {
        if (!r.ok) throw new Error('Error cargando clases');
        return r.json();
      })
    ])
    posts.value = resPosts
    clasesDisponibles.value = resClases
  } catch (error) {
    console.error('Error de red o de servidor:', error)
  }
})

async function publish() {
  if (!currentUser.idAlumno) {
    show('Debes iniciar sesión para publicar reseñas')
    return
  }

  const token = sessionStorage.getItem('token')
  const payload = {
    ID_Alumno: currentUser.idAlumno,
    ID_Prof_Mat: draft.ID_Prof_Mat,
    Puntaje: draft.Puntaje,
    Resena_texto: draft.content.trim()
  }

  try {
    const response = await fetch('http://localhost:3000/api/resenas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.message || 'Error al publicar en la base de datos')
    }

    show('¡Tu opinión fue publicada!')

    const updatedPosts = await fetch('http://localhost:3000/api/resenas').then(r => r.json())
    posts.value = updatedPosts

    justPostedId.value = data.id || null
    setTimeout(() => { justPostedId.value = null }, 1600)

    draft.content = ''
    draft.ID_Prof_Mat = ''
    draft.Puntaje = 0
  } catch (err) {
    console.error(err)
    show(err.message || 'Ocurrió un error al publicar')
  }
}

const filteredPosts = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return posts.value
  return posts.value.filter(p => 
    (p.teacher && p.teacher.toLowerCase().includes(q)) || 
    (p.subject && p.subject.toLowerCase().includes(q))
  )
})
</script>

<style scoped>
.intro { margin-bottom: 1.5rem; }
.lede { color: var(--slate); max-width: 52ch; margin-top: 0.5rem; }

.spotlight {
  background: linear-gradient(120deg, rgba(79, 195, 247, 0.14), rgba(21, 101, 192, 0.08));
  border: 1px solid rgba(21, 101, 192, 0.18);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
}
.spotlight-tag {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--blue-500);
  margin-bottom: 0.6rem;
}
.spotlight-body { display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap; }
.spotlight-avatar {
  width: 44px; height: 44px; border-radius: 50%; color: white;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-weight: 700; font-size: 0.9rem; flex: none;
}
.spotlight-info { display: flex; flex-direction: column; margin-right: 0.5rem; }
.spotlight-name { font-weight: 700; color: var(--navy); }
.spotlight-subject { font-size: 0.82rem; color: var(--slate); }
.spotlight-link {
  margin-left: auto;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--blue-500);
  text-decoration: none;
}
.spotlight-link:hover { text-decoration: underline; }

.composer {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  margin-bottom: 1.5rem;
}
.composer-top { display: flex; align-items: center; gap: 0.75rem; }
.avatar-sm {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--blue-500);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.75rem;
  flex: none;
}
.composer-top input {
  flex: 1;
  border: none;
  background: var(--paper);
  border-radius: 999px;
  padding: 0.6rem 1rem;
  font-family: var(--font-body);
  font-size: 0.92rem;
}
.composer-top input:focus { outline: 2px solid var(--blue-300); }
.composer-fields { display: flex; gap: 0.6rem; margin-top: 0.75rem; flex-wrap: wrap; align-items: center; }

/* Estilos ajustados para el select en lugar de los inputs anteriores */
.clase-select {
  flex: 1;
  min-width: 250px;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  background-color: var(--white);
}

.rating-picker { display: flex; gap: 2px; }
.star-btn { background: none; border: none; font-size: 1.2rem; color: var(--line); cursor: pointer; padding: 0; transition: transform 0.15s ease; }
.star-btn.active { color: var(--amber); }
.star-btn:hover { transform: scale(1.15); }
.composer-actions { display: flex; align-items: center; justify-content: flex-end; margin-top: 0.85rem; }

.publish {
  background: var(--blue-500);
  color: white;
  border: none;
  padding: 0.5rem 1.1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s ease, background 0.15s ease;
}
.publish:disabled { background: var(--line); color: var(--slate-light); cursor: not-allowed; }
.publish:not(:disabled):hover { background: var(--navy-soft); }
.publish:not(:disabled):active { transform: scale(0.96); }

.searchbar { margin-bottom: 1rem; }
.searchbar input {
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid var(--line);
  border-radius: 10px;
  font-size: 0.92rem;
  font-family: var(--font-body);
  background: var(--white);
}
.searchbar input:focus { border-color: var(--blue-500); }
.feed { margin-top: 0.25rem; }
</style>