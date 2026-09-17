<template>
  <div class="empty-state">
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="21" cy="21" r="13" />
      <line x1="30" y1="30" x2="41" y2="41" />
    </svg>
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({ message: { type: String, required: true } })
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 2.5rem 1rem;
  color: var(--slate-light);
  text-align: center;
}
.empty-state svg { width: 40px; height: 40px; opacity: 0.55; }
.empty-state p { margin: 0; font-size: 0.9rem; color: var(--slate); }
</style>
