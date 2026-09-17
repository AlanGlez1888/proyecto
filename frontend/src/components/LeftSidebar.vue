<template>
  <nav class="sidebar">
    <div class="mini-profile">
      <span class="avatar">{{ initials }}</span>
      <div class="who">
        <span class="name">{{ firstName }}</span>
        <span class="career">{{ shortCareer }}</span>
      </div>
    </div>

    <router-link to="/feed" class="item" active-class="active">
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 10l7-6 7 6M5 9v7a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V9" />
      </svg>
      Muro
    </router-link>
    <router-link to="/maestros" class="item" active-class="active">
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 4h5a2 2 0 012 2v10a2 2 0 00-2-2H4V4zM16 4h-5a2 2 0 00-2 2v10a2 2 0 012-2h5V4z" />
      </svg>
      Materias
    </router-link>
    <router-link to="/marketplace" class="item" active-class="active">
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 7h8l1 11H5L6 7zM8 7V5a2 2 0 114 0v2" />
      </svg>
      Marketplace
    </router-link>
    <router-link to="/amigos" class="item" active-class="active">
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M7 9a3 3 0 100-6 3 3 0 000 6zM2 17c0-2.8 2.2-5 5-5s5 2.2 5 5M14.5 9a2.3 2.3 0 100-4.6M18 17c0-2.1-1.5-3.9-3.5-4.4" />
      </svg>
      Amigos
    </router-link>
    <router-link
      v-if="currentUser.role === 'admin' || currentUser.role === 'moderador'"
      to="/admin"
      class="item"
      active-class="active"
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 2l7 3v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V5l7-3z" />
      </svg>
      Panel admin
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { currentUser } from '../data/currentUser.js'
import { initialsFor } from '../utils/subjectColor.js'

const initials = computed(() => initialsFor(currentUser.name))
const firstName = computed(() => currentUser.name.split(' ')[0])
const shortCareer = computed(() => {
  const words = currentUser.career.split(' ')
  return words.length > 3 ? words.slice(0, 3).join(' ') + '…' : currentUser.career
})
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 1.5rem 1rem;
  border-right: 1px solid var(--line);
}
.mini-profile {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0 0.4rem 1.1rem;
  margin-bottom: 0.6rem;
  border-bottom: 1px solid var(--line);
}
.mini-profile .avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--blue-500);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.8rem;
  flex: none;
}
.who { display: flex; flex-direction: column; min-width: 0; }
.name { font-weight: 600; font-size: 0.88rem; color: var(--ink); }
.career {
  font-size: 0.72rem;
  color: var(--slate);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}
.item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  color: var(--slate);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
}
.item svg { width: 18px; height: 18px; flex: none; }
.item:hover { background: var(--paper); color: var(--ink); }
.item.active { background: rgba(21, 101, 192, 0.1); color: var(--blue-500); }
</style>
