<template>
  <transition name="pop-fab">
    <button v-if="visible" class="scroll-top" type="button" @click="scrollTop" aria-label="Volver arriba">
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 12l6-6 6 6" />
      </svg>
    </button>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > 400
}
function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.scroll-top {
  position: fixed;
  bottom: 1.75rem;
  right: 1.75rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: var(--blue-500);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(13, 27, 62, 0.28);
  z-index: 50;
  transition: background 0.15s ease, transform 0.15s ease;
}
.scroll-top:hover { background: var(--navy-soft); transform: translateY(-2px); }
.scroll-top:active { transform: scale(0.92); }
.scroll-top svg { width: 20px; height: 20px; }
.pop-fab-enter-active, .pop-fab-leave-active { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-fab-enter-from, .pop-fab-leave-to { opacity: 0; transform: scale(0.5) translateY(10px); }
</style>
