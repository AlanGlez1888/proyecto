<template>
  <section class="page">
    <h1>Panel de administración</h1>

    <div class="metrics">
      <div class="metric" style="animation-delay: 0ms">
        <span class="num">{{ animatedUsers }}</span>
        <span class="label">Usuarios activos</span>
      </div>
      <div class="metric" style="animation-delay: 80ms">
        <span class="num">{{ animatedPosts }}</span>
        <span class="label">Publicaciones</span>
      </div>
      <div class="metric amber" style="animation-delay: 160ms">
        <span class="num">{{ reports.length }}</span>
        <span class="label">Reportes pendientes</span>
      </div>
    </div>

    <h2>Reportes recientes</h2>
    <transition-group tag="ul" name="report-list" class="reports">
      <li v-for="r in reports" :key="r.id">
        <span>{{ r.reason }}</span>
        <button type="button" class="review" @click="resolve(r.id)">Revisar</button>
      </li>
    </transition-group>
    <p v-if="reports.length === 0" class="all-clear">✅ No hay reportes pendientes por ahora.</p>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from '../composables/useToast.js'

const { show } = useToast()

const reports = ref([
  { id: 1, reason: 'Comentario reportado por lenguaje ofensivo' },
  { id: 2, reason: 'Publicación reportada como spam' }
])

function resolve(id) {
  reports.value = reports.value.filter(r => r.id !== id)
  show('Reporte resuelto')
}

const animatedUsers = ref(0)
const animatedPosts = ref(0)

function animateValue(targetRef, target, duration = 700) {
  const start = performance.now()
  function step(now) {
    const progress = Math.min((now - start) / duration, 1)
    targetRef.value = Math.round(progress * target)
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

onMounted(() => {
  animateValue(animatedUsers, 128)
  animateValue(animatedPosts, 342)
})
</script>

<style scoped>
.metrics {
  display: flex;
  gap: 2.5rem;
  margin: 1.75rem 0 1rem;
  padding-bottom: 1.75rem;
  border-bottom: 1px solid var(--line);
}
.metric { display: flex; flex-direction: column; animation: fadeInUp 0.4s ease both; }
.num {
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--blue-500);
}
.metric.amber .num { color: var(--amber); }
.label { font-size: 0.8rem; color: var(--slate); margin-top: 0.2rem; }
.reports { list-style: none; padding: 0; margin-top: 0.5rem; }
.reports li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--line);
}
.report-list-enter-active, .report-list-leave-active { transition: all 0.25s ease; }
.report-list-enter-from { opacity: 0; transform: translateX(-8px); }
.report-list-leave-to { opacity: 0; transform: translateX(30px); }
.report-list-leave-active { position: absolute; }
.review {
  background: none;
  border: 1px solid var(--line);
  color: var(--blue-500);
  font-weight: 600;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.15s ease, transform 0.1s ease;
}
.review:hover { background: rgba(21, 101, 192, 0.08); }
.review:active { transform: scale(0.94); }
.all-clear { color: var(--slate); margin-top: 1rem; animation: fadeInUp 0.3s ease both; }
</style>
