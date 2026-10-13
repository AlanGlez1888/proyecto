<template>
  <section class="page wide">
    <h1>Marketplace estudiantil</h1>
    <p class="lede">Materiales, guías y objetos entre compañeros. Sin pagos dentro de la plataforma.</p>

    <div class="toolbar">
      <input v-model="query" type="text" placeholder="Buscar por descripción o materia" />
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
      <input v-model="draft.descripcion" type="text" placeholder="Descripción del artículo" required />
      
      <select v-model.number="draft.idMateria" required>
        <option value="" disabled>Selecciona materia</option>
        <option v-for="m in materias" :key="m.id" :value="m.id">{{ m.nombre }}</option>
      </select>
      
      <select v-model="draft.tipo">
        <option value="Venta">Venta</option>
        <option value="Renta">Renta</option>
      </select>
      
      <label v-if="draft.tipo === 'Venta'" class="field">
        Precio (MXN)
        <input 
          v-model.number="draft.costo" 
          type="number" min="0" 
        />
      </label>
      
      <input v-model="draft.ubicacion" type="text" placeholder="Ubicación" />
      <input v-model="draft.telContacto" type="tel" placeholder="Teléfono de contacto" />
      
      <button type="submit">Publicar</button>
    </form>

    <div v-if="cargando" class="loading">Cargando marketplace...</div>

    <div v-else class="grid">
      <article v-for="item in filteredItems" :key="item.id" class="item">
        <div class="item-bar" :style="{ background: colorForSubject(item.materia || 'General') }"></div>
        <div class="item-body">
          <div class="item-top">
            <span class="subject" :style="{ color: colorForSubject(item.materia || 'General') }">
              {{ item.materia || 'General' }}
            </span>
          </div>
          <h3>{{ item.descripcion }}</h3>
          <p class="meta">{{ item.vendedor }}</p>
          <span class="price">
            {{ item.tipo === 'Venta' ? `$${item.costo} MXN` : 'Disponible en renta' }}
          </span>
          <p v-if="item.ubicacion" class="meta">📍 {{ item.ubicacion }}</p>
        </div>
      </article>
    </div>

    <EmptyState 
      v-if="!cargando && filteredItems.length === 0" 
      message="No hay artículos que coincidan con tu búsqueda." 
    />
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { colorForSubject } from '../utils/subjectColor.js'
import { useToast } from '../composables/useToast.js'
import EmptyState from '../components/EmptyState.vue'

const { show } = useToast()

const query = ref('')
const typeFilter = ref('todos')
const showForm = ref(false)

const typeOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'Venta', label: 'Venta' },
  { value: 'Renta', label: 'Renta' }
]

const items = ref([])
const materias = ref([])
const cargando = ref(true)

const draft = reactive({
  descripcion: '',
  idMateria: '',
  tipo: 'Venta',
  costo: 0,
  ubicacion: '',
  telContacto: ''
})

onMounted(async () => {
  try {
    const [resPub, resMat] = await Promise.all([
      fetch('http://localhost:3000/api/marketplace'),
      fetch('http://localhost:3000/api/materias')
    ])
    items.value = await resPub.json()
    materias.value = await resMat.json()
  } catch (err) {
    console.error('Error al cargar datos:', err)
    show('Error al cargar el marketplace')
  } finally {
    cargando.value = false
  }
})

async function publish() {
  // ✅ Leer fresco desde sessionStorage
  const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}')

  if (!currentUser.idAlumno) {
    show('Debes iniciar sesión como alumno para publicar')
    return
  }

  try {
    const response = await fetch('http://localhost:3000/api/marketplace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idAlumno: currentUser.idAlumno,
        idMateria: draft.idMateria || null,
        descripcion: draft.descripcion,
        tipo: draft.tipo,
        costo: draft.tipo === 'Venta' ? Number(draft.costo) || 0 : 0,
        ubicacion: draft.ubicacion || null,
        correoContacto: currentUser.correo || null,
        telContacto: draft.telContacto || null
      })
    })

    if (!response.ok) throw new Error('Error al publicar')

    const res = await fetch('http://localhost:3000/api/marketplace')
    items.value = await res.json()
    show('¡Artículo publicado en el marketplace!')

    draft.descripcion = ''
    draft.idMateria = ''
    draft.tipo = 'Venta'
    draft.costo = 0
    draft.ubicacion = ''
    draft.telContacto = ''
    showForm.value = false
  } catch (err) {
    console.error(err)
    show('Error al publicar el artículo')
  }
}

const filteredItems = computed(() => {
  const q = query.value.trim().toLowerCase()
  return items.value.filter(item => {
    const matchesQuery = !q
      || (item.descripcion && item.descripcion.toLowerCase().includes(q))
      || (item.materia && item.materia.toLowerCase().includes(q))
    const matchesType = typeFilter.value === 'todos' || item.tipo === typeFilter.value
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

.loading {
  text-align: center;
  color: var(--slate);
  padding: 2rem;
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
}
.item:hover { transform: translateY(-3px); box-shadow: 0 12px 26px rgba(13, 27, 62, 0.12); }
.item-bar { height: 5px; }
.item-body { padding: 1rem 1.1rem 1.2rem; }
.item-top { display: flex; align-items: center; justify-content: space-between; }
.item-body h3 { font-family: var(--font-display); font-size: 1rem; margin: 0.3rem 0 0.3rem; color: var(--ink); }
.subject { font-size: 0.75rem; font-weight: 600; }
.meta { color: var(--slate); font-size: 0.85rem; margin: 0 0 0.6rem; }
.price { font-weight: 600; color: var(--navy); }
</style>