<template>
  <span class="stars" :aria-label="`Calificación: ${rating} de 5`">
    <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= rating }">★</span>
  </span>
</template>

<script setup>
defineProps({
  rating: { type: Number, default: 0 }
})
</script>

<style scoped>
.stars { display: inline-flex; gap: 2px; }
.star { color: #d0d0d0; font-size: 1.1rem; }
.star.filled { color: #f5a623; }
</style>
