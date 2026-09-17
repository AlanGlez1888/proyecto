<template>
  <section class="page">
    <header class="header" v-if="teacher">
      <span class="badge" :style="{ background: colorForSubject(teacher.subject) }">
        {{ initialsFor(teacher.name) }}
      </span>
      <div>
        <h1>{{ teacher.name }}</h1>
        <p class="subject" :style="{ color: colorForSubject(teacher.subject) }">{{ teacher.subject }}</p>
        <RatingStars :rating="teacher.rating" />
      </div>
    </header>

    <h2>Comentarios</h2>
    <div class="feed">
      <PostCard v-for="post in comments" :key="post.id" :post="post" />
      <EmptyState v-if="comments.length === 0" message="Aún no hay comentarios sobre este maestro." />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import RatingStars from '../components/RatingStars.vue'
import PostCard from '../components/PostCard.vue'
import EmptyState from '../components/EmptyState.vue'
import { teachers, posts } from '../data/mockData.js'
import { colorForSubject, initialsFor } from '../utils/subjectColor.js'

const props = defineProps({ id: String })

const teacher = computed(() => teachers.find(t => String(t.id) === props.id))
const comments = computed(() => posts.filter(p => p.teacher === teacher.value?.name))
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
