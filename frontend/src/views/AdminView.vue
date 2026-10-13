<template>
  <section class="page">
    <h1>Panel de administración</h1>

    <div class="metrics">
      <div class="metric">
        <span class="num">128</span>
        <span class="label">Usuarios activos</span>
      </div>
      <div class="metric">
        <span class="num">342</span>
        <span class="label">Publicaciones</span>
      </div>
      <div class="metric amber">
        <span class="num">5</span>
        <span class="label">Reportes pendientes</span>
      </div>
    </div>

    <h2>Reportes recientes</h2>
    <ul class="reports">
      <li v-for="r in reports" :key="r.id">
        <span>{{ r.reason }}</span>
        <a href="#" class="review">Revisar</a>
      </li>
    </ul>
  </section>
</template>

<script setup>
const reports = [
  { id: 1, reason: 'Comentario reportado por lenguaje ofensivo' },
  { id: 2, reason: 'Publicación reportada como spam' }
]
</script>

<style scoped>
.metrics {
  display: flex;
  gap: 2.5rem;
  margin: 1.75rem 0 1rem;
  padding-bottom: 1.75rem;
  border-bottom: 1px solid var(--line);
}
.metric { display: flex; flex-direction: column; }
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
.review { color: var(--blue-500); font-weight: 600; text-decoration: none; font-size: 0.9rem; }
.review:hover { text-decoration: underline; }
</style>
