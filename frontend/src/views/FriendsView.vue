<template>
  <section class="page">
    <h1>Tus amigos</h1>
    <input v-model="query" type="text" placeholder="Buscar amigos" class="search" />

    <ul class="list">
      <li v-for="f in filtered" :key="f.id" class="row">
        <span class="avatar" :style="{ background: colorForSubject(f.name) }">{{ initialsFor(f.name) }}</span>
        <span class="info">
          <span class="name">{{ f.name }}</span>
          <span class="career">{{ f.career }}</span>
        </span>
        <span class="status" :class="{ online: f.online }">{{ f.online ? 'En línea' : 'Desconectado' }}</span>
      </li>
    </ul>
    <EmptyState v-if="filtered.length === 0" message="No encontramos amigos con ese nombre." />
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { friends } from '../data/mockData.js'
import { initialsFor, colorForSubject } from '../utils/subjectColor.js'
import EmptyState from '../components/EmptyState.vue'

const route = useRoute()
const query = ref(typeof route.query.q === 'string' ? route.query.q : '')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return friends
  return friends.filter(f => f.name.toLowerCase().includes(q))
})
</script>

<style scoped>
.search {
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid var(--line);
  border-radius: 10px;
  margin: 1.25rem 0 1.5rem;
  font-family: var(--font-body);
}
.list { list-style: none; padding: 0; margin: 0; }
.row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--line);
}
.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.85rem;
  flex: none;
}
.info { flex: 1; display: flex; flex-direction: column; }
.name { font-weight: 600; }
.career { font-size: 0.8rem; color: var(--slate); }
.status { font-size: 0.78rem; color: var(--slate-light); }
.status.online { color: #2e7d32; font-weight: 600; }
.empty { color: var(--slate); margin-top: 1.5rem; }
</style>
