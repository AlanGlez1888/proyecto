<template>
  <section class="page">
    <h1>Busca a tu maestro</h1>
    <div class="filters">
      <input v-model="query" type="text" placeholder="Nombre del maestro" />
      <select v-model="subject">
        <option value="">Todas las materias</option>
        <option v-for="s in subjects" :key="s">{{ s }}</option>
      </select>
    </div>

    <ul class="results">
      <li v-for="t in filtered" :key="t.id">
        <router-link :to="`/maestros/${t.id}`" class="row">
          <span class="badge" :style="{ background: colorForSubject(t.subject) }">
            {{ initialsFor(t.name) }}
          </span>
          <span class="info">
            <span class="name">{{ t.name }}</span>
            <span class="subject" :style="{ color: colorForSubject(t.subject) }">{{ t.subject }}</span>
          </span>
          <RatingStars :rating="t.rating" />
        </router-link>
      </li>
    </ul>
    <EmptyState v-if="filtered.length === 0" message="No encontramos maestros con esos filtros." />
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import RatingStars from '../components/RatingStars.vue'
import EmptyState from '../components/EmptyState.vue'
import { teachers } from '../data/mockData.js'
import { colorForSubject, initialsFor } from '../utils/subjectColor.js'

const route = useRoute()
const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
const subject = ref('')

const subjects = [...new Set(teachers.map(t => t.subject))]

const filtered = computed(() =>
  teachers.filter(t =>
    t.name.toLowerCase().includes(query.value.toLowerCase()) &&
    (subject.value === '' || t.subject === subject.value)
  )
)
</script>

<style scoped>
.filters { display: flex; gap: 0.75rem; margin: 1.5rem 0 0.5rem; }
.filters input, .filters select {
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-family: var(--font-body);
  background: var(--white);
}
.filters input { flex: 1; }
.results { list-style: none; padding: 0; margin: 0.5rem 0 0; }
.row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--line);
  text-decoration: none;
  color: var(--ink);
}
.badge {
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.85rem;
}
.info { flex: 1; display: flex; flex-direction: column; }
.name { font-weight: 600; }
.subject { font-size: 0.85rem; margin-top: 0.1rem; }
.empty { color: var(--slate); margin-top: 1.5rem; }
</style>
