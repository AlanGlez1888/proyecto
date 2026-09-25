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
        <button class="like" :class="{ pulsing }" type="button" @click="onLike">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 9v9H4a1 1 0 01-1-1v-7a1 1 0 011-1h3zm0 0l3.5-6a2 2 0 013.8.9L13.5 8H16a2 2 0 012 2.2l-1.1 6A2 2 0 0114.9 18H7" />
          </svg>
          Útil <span class="count">{{ post.likes }}</span>
        </button>
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
  highlighted: { type: Boolean, default: false }
})

const accentColor = computed(() => colorForSubject(props.post.subject))
const avatarInitials = computed(() => (props.post.anonymous ? '?' : initialsFor(props.post.author)))

const pulsing = ref(false)
function onLike() {
  props.post.likes++
  pulsing.value = true
  setTimeout(() => { pulsing.value = false }, 320)
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
.post-footer { display: flex; align-items: center; justify-content: space-between; }
.author { font-size: 0.8rem; color: var(--slate); }
.like {
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
.like svg { width: 13px; height: 13px; }
.like:hover { border-color: var(--blue-500); color: var(--blue-500); }
.like.pulsing { animation: pulse 0.32s ease; border-color: var(--blue-500); color: var(--blue-500); }
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}
.count { font-weight: 700; }
</style>
