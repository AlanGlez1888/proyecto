<template>
  <div class="toast-host">
    <transition-group name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type">
        {{ t.message }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast.js'
const { toasts } = useToast()
</script>

<style scoped>
.toast-host {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  z-index: 100;
}
.toast {
  background: var(--navy);
  color: white;
  padding: 0.75rem 1.1rem;
  border-radius: 10px;
  font-size: 0.88rem;
  font-family: var(--font-body);
  box-shadow: 0 12px 30px rgba(13, 27, 62, 0.3);
  border-left: 4px solid var(--blue-300);
  max-width: 280px;
}
.toast.success { border-left-color: #2e7d32; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateY(10px); }
.toast-leave-to { opacity: 0; transform: translateX(20px); }
</style>
