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
      <button type="submit">Publicar</button>
    </form>

    <div class="grid">
      <article v-for="item in filteredItems" :key="item.id" class="item">
        <div class="item-bar" :style="{ background: colorForSubject(item.subject) }"></div>
        <div class="item-body">
          <span class="subject" :style="{ color: colorForSubject(item.subject) }">{{ item.subject }}</span>
          <h3>{{ item.title }}</h3>
          <p class="meta">{{ item.condition }} · {{ item.seller }}</p>
          <span class="price">{{ item.type === 'venta' ? `$${item.price} MXN` : 'Disponible en renta' }}</span>
        </div>
      </article>
    </div>
    <p v-if="filteredItems.length === 0" class="empty">No hay artículos que coincidan con tu búsqueda.</p>
  </section>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { marketplaceItems } from '../data/mockData.js'
import { currentUser } from '../data/currentUser.js'
import { colorForSubject } from '../utils/subjectColor.js'

const query = ref('')
const typeFilter = ref('todos')
const showForm = ref(false)

const typeOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'venta', label: 'Venta' },
  { value: 'renta', label: 'Renta' }
]

const draft = reactive({ title: '', subject: '', condition: 'Buen estado', type: 'venta', price: 0 })

function publish() {
  marketplaceItems.unshift({
    id: Date.now(),
    title: draft.title.trim(),
    subject: draft.subject.trim(),
    condition: draft.condition,
    type: draft.type,
    price: draft.type === 'venta' ? Number(draft.price) || 0 : 0,
    seller: currentUser.name
  })
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
}
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
}
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
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}
.item { background: var(--white); border-radius: 10px; overflow: hidden; border: 1px solid var(--line); }
.item-bar { height: 5px; }
.item-body { padding: 1rem 1.1rem 1.2rem; }
.item-body h3 { font-family: var(--font-display); font-size: 1rem; margin: 0.3rem 0 0.3rem; color: var(--ink); }
.subject { font-size: 0.75rem; font-weight: 600; }
.meta { color: var(--slate); font-size: 0.85rem; margin: 0 0 0.6rem; }
.price { font-weight: 600; color: var(--navy); }
.empty { color: var(--slate); margin-top: 1.5rem; }
</style>
