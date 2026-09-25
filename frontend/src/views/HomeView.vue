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
        <input v-model="draft.teacher" type="text" placeholder="Maestro" />
        <input v-model="draft.subject" type="text" placeholder="Materia" />
        <div class="rating-picker">
          <button
            v-for="n in 5" :key="n" type="button"
            class="star-btn" :class="{ active: n <= draft.rating }"
            @click="draft.rating = n"
          >★</button>
        </div>
      </div>
      <div class="composer-actions">
        <label class="anon">
          <input type="checkbox" v-model="draft.anonymous" /> Publicar como anónimo
        </label>
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
import { ref, reactive, computed } from 'vue'
import PostCard from '../components/PostCard.vue'
import EmptyState from '../components/EmptyState.vue'
import RatingStars from '../components/RatingStars.vue'
import { posts, teachers } from '../data/mockData.js'
import { currentUser } from '../data/currentUser.js'
import { initialsFor, colorForSubject } from '../utils/subjectColor.js'
import { useToast } from '../composables/useToast.js'

const { show } = useToast()

const query = ref('')
const initials = computed(() => initialsFor(currentUser.name))

const spotlightTeacher = computed(() =>
  [...teachers].sort((a, b) => b.rating - a.rating)[0]
)

const draft = reactive({ content: '', teacher: '', subject: '', rating: 0, anonymous: false })
const canPublish = computed(
  () => draft.content.trim() && draft.teacher.trim() && draft.subject.trim() && draft.rating > 0
)

const justPostedId = ref(null)

function publish() {
  const newPost = {
    id: Date.now(),
    author: currentUser.name,
    anonymous: draft.anonymous,
    teacher: draft.teacher.trim(),
    subject: draft.subject.trim(),
    content: draft.content.trim(),
    rating: draft.rating,
    likes: 0
  }
  posts.unshift(newPost)
  justPostedId.value = newPost.id
  setTimeout(() => { justPostedId.value = null }, 1600)
  show('¡Tu opinión fue publicada!')

  draft.content = ''
  draft.teacher = ''
  draft.subject = ''
  draft.rating = 0
  draft.anonymous = false
}

const filteredPosts = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return posts
  return posts.filter(p => p.teacher.toLowerCase().includes(q) || p.subject.toLowerCase().includes(q))
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
.composer-fields input {
  flex: 1;
  min-width: 120px;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.85rem;
}
.rating-picker { display: flex; gap: 2px; }
.star-btn { background: none; border: none; font-size: 1.2rem; color: var(--line); cursor: pointer; padding: 0; transition: transform 0.15s ease; }
.star-btn.active { color: var(--amber); }
.star-btn:hover { transform: scale(1.15); }
.composer-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 0.85rem; }
.anon { display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; color: var(--slate); }
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
