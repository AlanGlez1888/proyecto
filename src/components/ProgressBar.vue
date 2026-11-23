<template>
  <div class="progress-bar" :class="progress.state"></div>
</template>

<script setup>
import { progress } from '../composables/useProgress.js'
</script>

<style scoped>
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  width: 0%;
  background: linear-gradient(90deg, var(--blue-300), var(--blue-500));
  z-index: 999;
  opacity: 0;
  pointer-events: none;
}
.progress-bar.loading {
  width: 72%;
  opacity: 1;
  transition: width 0.45s ease, opacity 0.15s ease;
}
.progress-bar.done {
  width: 100%;
  opacity: 1;
  transition: width 0.2s ease;
}
.progress-bar.idle {
  width: 0%;
  opacity: 0;
  transition: opacity 0.25s ease 0.1s;
}
</style>
