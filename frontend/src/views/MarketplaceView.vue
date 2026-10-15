<template>
  <section class="page wide">
    <h1>Marketplace estudiantil</h1>
    <p class="lede">Materiales, guías y objetos entre compañeros. Sin pagos dentro de la plataforma.</p>

    <!-- PESTAÑAS PRINCIPALES -->
    <div class="main-tabs">
      <button :class="{ active: currentTab === 'explorar' }" @click="currentTab = 'explorar'">Explorar</button>
      <button :class="{ active: currentTab === 'mis-publicaciones' }" @click="currentTab = 'mis-publicaciones'">Mis publicaciones</button>
    </div>

    <!-- ==================== PESTAÑA: EXPLORAR ==================== -->
    <div v-if="currentTab === 'explorar'">
      <div class="toolbar">
        <input v-model="query" type="text" placeholder="Buscar por descripción o materia" />
        <div class="tabs">
          <button 
            v-for="opt in typeOptions" :key="opt.value" 
            type="button" class="tab" :class="{ active: typeFilter === opt.value }" 
            @click="typeFilter = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div v-if="cargando" class="loading">Cargando marketplace...</div>
      
      <div v-else class="grid">
        <article v-for="item in explorarItems" :key="item.id" class="item">
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
        v-if="!cargando && explorarItems.length === 0" 
        message="No hay artículos que coincidan con tu búsqueda." 
      />
    </div>

    <!-- ==================== PESTAÑA: MIS PUBLICACIONES ==================== -->
    <div v-if="currentTab === 'mis-publicaciones'">
      <div class="toolbar" style="justify-content: flex-end;">
        <button class="publish-btn" type="button" @click="cancelarEdicion">
          {{ showForm ? 'Cancelar' : '+ Publicar artículo' }}
        </button>
      </div>

      <!-- Formulario de creación / edición -->
      <form v-if="showForm" class="new-item" @submit.prevent="savePost">
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
          <input v-model.number="draft.costo" type="number" min="0" />
        </label>
        
        <input v-model="draft.ubicacion" type="text" placeholder="Ubicación" />
        <input v-model="draft.telContacto" type="tel" placeholder="Teléfono de contacto" />
        
        <button type="submit">{{ editandoId ? 'Guardar Cambios' : 'Publicar' }}</button>
      </form>

      <div v-if="cargandoMisPubs" class="loading">Cargando tu historial...</div>
      
      <div v-else class="grid">
        <article v-for="item in misPublicaciones" :key="item.id" class="item my-item">
          <div class="item-bar" :style="{ background: colorForSubject(item.materia || 'General') }"></div>
          <div class="item-body">
            <div class="item-top">
              <span class="subject" :style="{ color: colorForSubject(item.materia || 'General') }">
                {{ item.materia || 'General' }}
              </span>
              <span class="badge">{{ item.tipo }}</span>
            </div>
            <h3>{{ item.descripcion }}</h3>
            <span class="price">
              {{ item.tipo === 'Venta' ? `$${item.costo} MXN` : 'Renta' }}
            </span>
            
            <!-- Botones de Acción para Mis Publicaciones -->
            <div class="actions mt-2">
              <button type="button" class="btn-edit" @click="iniciarEdicion(item)">Editar</button>
              <button type="button" class="btn-delete" @click="eliminarArticulo(item.id)">Eliminar</button>
            </div>
          </div>
        </article>
      </div>

      <EmptyState 
        v-if="!cargandoMisPubs && misPublicaciones.length === 0" 
        message="Aún no has publicado nada." 
      />
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { colorForSubject } from '../utils/subjectColor.js'
import { useToast } from '../composables/useToast.js'
import EmptyState from '../components/EmptyState.vue'

const { show } = useToast()

// Usuario actual
const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}')

// Estado de navegación
const currentTab = ref('explorar') // 'explorar' | 'mis-publicaciones'
const showForm = ref(false)
const editandoId = ref(null)

// Búsqueda y filtros
const query = ref('')
const typeFilter = ref('todos')
const typeOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'Venta', label: 'Venta' },
  { value: 'Renta', label: 'Renta' }
]

// Datos
const items = ref([]) // Todas las publicaciones
const misPublicaciones = ref([]) // Solo las del usuario
const materias = ref([])
const cargando = ref(true)
const cargandoMisPubs = ref(false)

const draft = reactive({
  descripcion: '',
  idMateria: '',
  tipo: 'Venta',
  costo: 0,
  ubicacion: '',
  telContacto: ''
})

// Cargar datos iniciales
onMounted(async () => {
  await cargarMarketplace()
})

// Detectar cuando cambiamos de pestaña para cargar "Mis Publicaciones" si es necesario
watch(currentTab, async (newTab) => {
  if (newTab === 'mis-publicaciones' && misPublicaciones.value.length === 0) {
    await cargarMisPublicaciones()
  }
})

async function cargarMarketplace() {
  cargando.value = true
  try {
    const [resPub, resMat] = await Promise.all([
      fetch('http://localhost:3000/api/marketplace'),
      fetch('http://localhost:3000/api/materias')
    ])
    items.value = await resPub.json()
    materias.value = await resMat.json()
  } catch (err) {
    console.error(err)
    show('Error al cargar el marketplace')
  } finally {
    cargando.value = false
  }
}

async function cargarMisPublicaciones() {
  if (!currentUser.idAlumno) return
  cargandoMisPubs.value = true
  try {
    const res = await fetch(`http://localhost:3000/api/marketplace/alumno/${currentUser.idAlumno}`)
    misPublicaciones.value = await res.json()
  } catch (err) {
    console.error(err)
    show('Error al cargar tu historial')
  } finally {
    cargandoMisPubs.value = false
  }
}

function iniciarEdicion(item) {
  editandoId.value = item.id
  draft.descripcion = item.descripcion
  draft.idMateria = item.idMateria || ''
  draft.tipo = item.tipo
  draft.costo = item.costo
  draft.ubicacion = item.ubicacion || ''
  draft.telContacto = item.telContacto || ''
  showForm.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelarEdicion() {
  showForm.value = !showForm.value
  if (!showForm.value) {
    Object.assign(draft, { descripcion: '', idMateria: '', tipo: 'Venta', costo: 0, ubicacion: '', telContacto: '' })
    editandoId.value = null
  }
}

async function savePost() {
  if (!currentUser.idAlumno) {
    show('Debes iniciar sesión para publicar')
    return
  }

  const url = editandoId.value 
    ? `http://localhost:3000/api/marketplace/${editandoId.value}`
    : 'http://localhost:3000/api/marketplace'
  
  const method = editandoId.value ? 'PUT' : 'POST'

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idAlumno: currentUser.idAlumno,
        idMateria: draft.idMateria || null,
        descripcion: draft.descripcion,
        tipo: draft.tipo,
        costo: draft.tipo === 'Venta' ? Number(draft.costo) || 0 : 0,
        ubicacion: draft.ubicacion || null,
        telContacto: draft.telContacto || null
      })
    })

    if (!response.ok) throw new Error('Error al guardar')

    show(editandoId.value ? '¡Cambios guardados!' : '¡Artículo publicado!')
    
    // Recargar listas
    await cargarMisPublicaciones()
    await cargarMarketplace()

    // Limpiar
    cancelarEdicion()
    showForm.value = false
  } catch (err) {
    console.error(err)
    show('Error al guardar el artículo')
  }
}

async function eliminarArticulo(id) {
  if (!confirm('¿Seguro que deseas eliminar esta publicación?')) return;

  try {
    const response = await fetch(`http://localhost:3000/api/marketplace/${id}?idAlumno=${currentUser.idAlumno}`, {
      method: 'DELETE'
    })

    if (!response.ok) throw new Error('Error al eliminar')

    show('Publicación eliminada')
    await cargarMisPublicaciones()
    await cargarMarketplace()
  } catch (err) {
    console.error(err)
    show('Error al eliminar el artículo')
  }
}

// Filtro para explorar (excluye las del usuario activo)
const explorarItems = computed(() => {
  const q = query.value.trim().toLowerCase()
  return items.value.filter(item => {
    const isNotMine = item.idAlumno !== currentUser.idAlumno
    const matchesQuery = !q 
      || (item.descripcion && item.descripcion.toLowerCase().includes(q)) 
      || (item.materia && item.materia.toLowerCase().includes(q))
    const matchesType = typeFilter.value === 'todos' || item.tipo === typeFilter.value
    return isNotMine && matchesQuery && matchesType
  })
})
</script>

<style scoped>
.page.wide { max-width: 900px; }
.lede { color: var(--slate); margin-top: 0.4rem; }

/* Navegación por pestañas */
.main-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--line);
  padding-bottom: 0.5rem;
}
.main-tabs button {
  background: none;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--slate);
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s;
}
.main-tabs button.active {
  color: var(--navy);
  background: var(--blue-100);
}
.main-tabs button:hover:not(.active) {
  background: var(--gray-100);
}

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

/* Estilos extra para Mis Publicaciones */
.badge {
  font-size: 0.7rem;
  background: var(--gray-200);
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: bold;
}
.my-item {
  border: 2px solid var(--blue-200);
}
.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  border-top: 1px solid var(--line);
  padding-top: 0.8rem;
}
.btn-edit, .btn-delete {
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  border: none;
  font-weight: 600;
}
.btn-edit { background: var(--blue-100); color: var(--navy); }
.btn-delete { background: #fee2e2; color: #dc2626; }
.btn-edit:hover { background: var(--blue-200); }
.btn-delete:hover { background: #fecaca; }
.mt-2 { margin-top: 0.5rem; }
</style>