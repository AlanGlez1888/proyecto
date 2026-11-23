<template>
  <section class="page wide">
    <h1>Marketplace estudiantil</h1>
    <p class="lede">Materiales, guías y objetos entre compañeros. Sin pagos dentro de la plataforma.</p>

    <div class="toolbar">
      <input v-model="query" type="text" placeholder="Buscar por título o materia" />
      <div class="tabs">
        <button
          v-for="opt in typeOptions" :key="opt.value"
          type="button" class="tab" :class="{ active: typeFilter === opt.value }"
          @click="typeFilter = opt.value"
        >{{ opt.label }}</button>
      </div>
      <button class="publish-btn" type="button" @click="showForm = !showForm">
        {{ showForm ? 'Cancelar' : '+ Publicar artículo' }}
      </button>
    </div>

    <transition name="slide-down">
      <form v-if="showForm" class="new-item" @submit.prevent="publish">
        <input v-model="draft.title" type="text" placeholder="Título del artículo" required />
        <input v-model="draft.subject" type="text" placeholder="Materia" required />
        <select v-model="draft.condition">
          <option>Nuevo</option>
          <option>Buen estado</option>
          <option>Usado</option>
        </select>
        <select v-model="draft.type">
          <option value="venta">Venta</option>
          <option value="renta">Renta</option>
        </select>
        <input v-if="draft.type === 'venta'" v-model.number="draft.price" type="number" min="0" placeholder="Precio (MXN)" />
        <span class="publish-wrap">
          <button type="submit">Publicar</button>
          <ConfettiBurst v-if="showConfetti" />
        </span>
      </form>
    </transition>

    <div v-if="loading" class="grid">
      <div v-for="n in 3" :key="n" class="skeleton-item">
        <div class="skeleton" style="height: 5px;"></div>
        <div style="padding: 1rem 1.1rem;">
          <div class="skeleton" style="width: 50%; height: 10px; margin-bottom: 10px;"></div>
          <div class="skeleton" style="width: 85%; height: 14px; margin-bottom: 10px;"></div>
          <div class="skeleton" style="width: 40%; height: 12px;"></div>
        </div>
      </div>
    </div>
    <div v-else class="grid">
      <article v-for="item in filteredItems" :key="item.id" class="item">
        <div class="item-bar" :style="{ background: colorForSubject(item.subject) }"></div>
        <div class="item-body">
          <div class="item-top">
            <span class="subject" :style="{ color: colorForSubject(item.subject) }">{{ item.subject }}</span>
            <span v-if="item.isNew" class="new-badge">Nuevo</span>
          </div>
          <h3>{{ item.title }}</h3>
          <p class="meta">{{ item.condition }} · {{ item.seller }}</p>
          <span class="price">{{ item.type === 'venta' ? `$${item.price} MXN` : 'Disponible en renta' }}</span>
        </div>
      </article>
    </div>
    <EmptyState v-if="!loading && filteredItems.length === 0" message="No hay artículos que coincidan con tu búsqueda." />
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { marketplaceItems } from '../data/mockData.js'
import { currentUser } from '../data/currentUser.js'
import { colorForSubject } from '../utils/subjectColor.js'
import { useToast } from '../composables/useToast.js'
import EmptyState from '../components/EmptyState.vue'
import ConfettiBurst from '../components/ConfettiBurst.vue'

const { show } = useToast()

const loading = ref(true)
onMounted(() => setTimeout(() => { loading.value = false }, 450))

const query = ref('')
const typeFilter = ref('todos')
const showForm = ref(false)
const showConfetti = ref(false)

const typeOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'venta', label: 'Venta' },
  { value: 'renta', label: 'Renta' }
]

const draft = reactive({ title: '', subject: '', condition: 'Buen estado', type: 'venta', price: 0 })

function publish() {
  const id = Date.now()
  marketplaceItems.unshift({
    id,
    title: draft.title.trim(),
    subject: draft.subject.trim(),
    condition: draft.condition,
    type: draft.type,
    price: draft.type === 'venta' ? Number(draft.price) || 0 : 0,
    seller: currentUser.name,
    isNew: true
  })
  show('¡Artículo publicado en el marketplace!')
  showConfetti.value = false
  nextTick(() => { showConfetti.value = true })
  setTimeout(() => { showConfetti.value = false }, 700)
  setTimeout(() => {
    const item = marketplaceItems.find(i => i.id === id)
    if (item) item.isNew = false
  }, 5000)

  draft.title = ''
  draft.subject = ''
  draft.condition = 'Buen estado'
  draft.type = 'venta'
  draft.price = 0
  showForm.value = false
}

const filteredItems = computed(() => {
  const q = query.value.trim().toLowerCase()
  return marketplaceItems.filter(item => {
    const matchesQuery = !q || item.title.toLowerCase().includes(q) || item.subject.toLowerCase().includes(q)
    const matchesType = typeFilter.value === 'todos' || item.type === typeFilter.value
    return matchesQuery && matchesType
  })
})
</script>

<style scoped>
.page.wide { max-width: 900px; }
.lede { color: var(--slate); margin-top: 0.4rem; }
.toolbar { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; margin: 1.5rem 0 1rem; }
.toolbar input {
  flex: 1;
  min-width: 200px;
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-family: var(--font-body);
}
.tabs { display: flex; gap: 0.35rem; }
.tab {
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--white);
  font-size: 0.82rem;
  cursor: pointer;
  color: var(--slate);
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
}
.tab:active { transform: scale(0.94); }
.tab.active { background: var(--blue-500); border-color: var(--blue-500); color: white; font-weight: 600; }
.publish-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: var(--navy);
  color: white;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, transform 0.1s ease;
}
.publish-btn:active { transform: scale(0.96); }
.publish-btn:hover { background: var(--navy-soft); }

.new-item {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}
.new-item input, .new-item select {
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-family: var(--font-body);
  flex: 1;
  min-width: 140px;
}
.new-item button {
  padding: 0.55rem 1.1rem;
  border: none;
  border-radius: 8px;
  background: var(--blue-500);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
}
.new-item button:hover { background: var(--navy-soft); }
.new-item button:active { transform: scale(0.96); }
.publish-wrap { position: relative; display: inline-block; }

.slide-down-enter-active, .slide-down-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease, margin 0.22s ease;
  overflow: hidden;
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  margin-bottom: 0 !important;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}
.item {
  background: var(--white);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--line);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  animation: fadeInUp 0.3s ease both;
}
.item:nth-child(1) { animation-delay: 0ms; }
.item:nth-child(2) { animation-delay: 60ms; }
.item:nth-child(3) { animation-delay: 120ms; }
.item:nth-child(n+4) { animation-delay: 180ms; }
.item:hover { transform: translateY(-3px); box-shadow: 0 12px 26px rgba(13, 27, 62, 0.12); }
.skeleton-item {
  background: var(--white);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--line);
}
.item-bar { height: 5px; }
.item-body { padding: 1rem 1.1rem 1.2rem; }
.item-top { display: flex; align-items: center; justify-content: space-between; }
.new-badge {
  background: var(--amber);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  animation: badgePulse 1.4s ease-in-out infinite;
}
@keyframes badgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
.item-body h3 { font-family: var(--font-display); font-size: 1rem; margin: 0.3rem 0 0.3rem; color: var(--ink); }
.subject { font-size: 0.75rem; font-weight: 600; }
.meta { color: var(--slate); font-size: 0.85rem; margin: 0 0 0.6rem; }
.price { font-weight: 600; color: var(--heading); }
</style>
