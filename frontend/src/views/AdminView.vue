<template>
  <section class="admin-page" v-if="usuario">
    <div class="admin-header">
      <div>
        <h1>Panel de Administración</h1>
        <p class="subtitle">Moderación de contenido, usuarios y métricas de la plataforma</p>
      </div>
      <span class="role-badge">{{ rolActual }}</span>
    </div>

    <!-- Tarjetas de Métricas -->
    <div class="metrics-grid">
      <div class="metric-card">
        <span class="metric-num">{{ metricas.usuariosActivos }}</span>
        <span class="metric-label">Usuarios activos</span>
      </div>
      <div class="metric-card warn">
        <span class="metric-num">{{ metricas.usuariosSuspendidos }}</span>
        <span class="metric-label">Suspendidos / Baneados</span>
      </div>
      <div class="metric-card danger">
        <span class="metric-num">{{ metricas.reportesPendientes }}</span>
        <span class="metric-label">Reportes pendientes</span>
      </div>
      <div class="metric-card">
        <span class="metric-num">{{ totalPublicaciones }}</span>
        <span class="metric-label">Artículos publicados</span>
      </div>
    </div>

    <!-- Navegación por pestañas -->
    <div class="tabs">
      <button
        :class="['tab', { active: tab === 'reportes' }]"
        @click="tab = 'reportes'"
      >
        Reportes pendientes ({{ reportes.length }})
      </button>
      <button
        :class="['tab', { active: tab === 'metricas' }]"
        @click="tab = 'metricas'"
      >
        Publicaciones por categoría
      </button>
      <button
        v-if="esAdmin"
        :class="['tab', { active: tab === 'usuarios' }]"
        @click="tab = 'usuarios'"
      >
        Usuarios y roles ({{ usuarios.length }})
      </button>
      <button
        v-if="esAdmin"
        :class="['tab', { active: tab === 'categorias' }]"
        @click="tab = 'categorias'"
      >
        Categorías / Materias
      </button>
    </div>

    <!-- PESTAÑA 1: MODERACIÓN DE REPORTES -->
    <div v-if="tab === 'reportes'" class="panel-card">
      <h2>Revisión de contenido reportado</h2>
      <p v-if="reportes.length === 0" class="empty">No hay reportes pendientes por revisar.</p>

      <div v-else class="report-list">
        <div v-for="rep in reportes" :key="rep.id" class="report-item">
          <div class="report-info">
            <div class="report-top">
              <span class="type-tag">
                {{ rep.id_pub ? 'Artículo Marketplace' : rep.id_resena ? 'Reseña Profesor' : 'Usuario' }}
              </span>
              <span class="count-tag">{{ rep.conteo }} {{ rep.conteo === 1 ? 'reporte' : 'reportes' }}</span>
            </div>
            <p class="report-content">
              "{{ rep.pub_descripcion || rep.resena_contenido || rep.usuario_correo || 'Contenido sin texto' }}"
            </p>
            <p class="report-reason"><strong>Motivo:</strong> {{ rep.motivo || 'No especificado' }}</p>
          </div>

          <div class="report-actions">
            <button class="btn-danger" @click="atenderReporte(rep.id, 'eliminar')">
              {{ rep.id_usuario_reportado ? 'Suspender usuario' : 'Eliminar contenido' }}
            </button>
            <button class="btn-secondary" @click="atenderReporte(rep.id, 'descartar')">
              Descartar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- PESTAÑA 2: MÉTRICAS POR CATEGORÍA -->
    <div v-if="tab === 'metricas'" class="panel-card">
      <h2>Publicaciones por categoría (Materia)</h2>
      <div class="category-bars">
        <div v-for="cat in metricas.publicacionesPorCategoria" :key="cat.id" class="bar-row">
          <span class="bar-name">{{ cat.categoria }}</span>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{ width: totalPublicaciones ? `${(cat.total / totalPublicaciones) * 100}%` : '0%' }"
            ></div>
          </div>
          <span class="bar-count">{{ cat.total }}</span>
        </div>
      </div>
    </div>

    <!-- PESTAÑA 3: USUARIOS, ROLES Y SUSPENSIONES (SOLO ADMIN) -->
    <div v-if="tab === 'usuarios' && esAdmin" class="panel-card">
      <h2>Gestión de usuarios y permisos</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in usuarios" :key="u.id">
              <td>{{ u.nombre || 'Sin perfil alumno' }}</td>
              <td>{{ u.correo }}</td>
              <td>
                <select v-model="u.rol" :disabled="u.id === usuario.id">
                  <option value="alumno">Alumno</option>
                  <option value="moderador">Moderador</option>
                  <option value="administrador">Administrador</option>
                </select>
              </td>
              <td>
                <select v-model="u.estado" :disabled="u.id === usuario.id">
                  <option value="activo">Activo</option>
                  <option value="suspendido">Suspendido</option>
                  <option value="baneado">Baneado</option>
                </select>
              </td>
              <td>
                <button
                  class="btn-primary sm"
                  :disabled="u.id === usuario.id"
                  @click="guardarUsuario(u)"
                >
                  Guardar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- PESTAÑA 4: GESTIÓN DE CATEGORÍAS (SOLO ADMIN) -->
    <div v-if="tab === 'categorias' && esAdmin" class="panel-card">
      <h2>Administrar categorías (Materias)</h2>

      <form class="cat-form" @submit.prevent="agregarCategoria">
        <input v-model="nuevaCat.nombre" type="text" placeholder="Nombre de la materia/categoría" required />
        <input v-model.number="nuevaCat.semestre" type="number" min="1" max="12" placeholder="Semestre" required />
        <input v-model.number="nuevaCat.creditos" type="number" min="1" max="15" placeholder="Créditos" required />
        <button type="submit" class="btn-primary">Agregar</button>
      </form>

      <div class="cat-list">
        <div v-for="cat in metricas.publicacionesPorCategoria" :key="cat.id" class="cat-item">
          <span>{{ cat.categoria }} <small>({{ cat.total }} artículos)</small></span>
          <button class="btn-danger sm" @click="borrarCategoria(cat.id)">Eliminar</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const usuario = ref(null)
const tab = ref('reportes')

const metricas = reactive({
  usuariosActivos: 0,
  usuariosSuspendidos: 0,
  reportesPendientes: 0,
  publicacionesPorCategoria: []
})

const reportes = ref([])
const usuarios = ref([])
const nuevaCat = reactive({ nombre: '', semestre: 1, creditos: 5 })

const rolActual = computed(() =>
  (usuario.value?.rol || usuario.value?.Rol || '').toLowerCase()
)
const esAdmin = computed(() => rolActual.value === 'administrador')

const totalPublicaciones = computed(() =>
  metricas.publicacionesPorCategoria.reduce((acc, c) => acc + Number(c.total || 0), 0)
)

async function cargarDatos() {
  const token = sessionStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  try {
    const peticiones = [
      fetch('http://localhost:3000/api/admin/metricas', { headers }),
      fetch('http://localhost:3000/api/admin/reportes', { headers })
    ]

    if (esAdmin.value) {
      peticiones.push(fetch('http://localhost:3000/api/admin/usuarios', { headers }))
    }

    const [resMetricas, resReportes, resUsuarios] = await Promise.all(peticiones)

    if (resMetricas.status === 403) {
      router.push('/feed')
      return
    }

    if (resMetricas.ok) {
      const data = await resMetricas.json()
      metricas.usuariosActivos = data.usuariosActivos
      metricas.usuariosSuspendidos = data.usuariosSuspendidos
      metricas.reportesPendientes = data.reportesPendientes
      metricas.publicacionesPorCategoria = data.publicacionesPorCategoria
    }

    if (resReportes.ok) {
      reportes.value = await resReportes.json()
    }

    if (resUsuarios && resUsuarios.ok) {
      usuarios.value = await resUsuarios.json()
    }
  } catch (error) {
    console.error('Error cargando panel admin:', error)
  }
}

onMounted(() => {
  const userData = sessionStorage.getItem('user')
  const token = sessionStorage.getItem('token')

  if (!userData || !token) {
    router.push('/')
    return
  }

  usuario.value = JSON.parse(userData)
  if (rolActual.value !== 'administrador' && rolActual.value !== 'moderador') {
    router.push('/feed')
    return
  }

  cargarDatos()
})

async function atenderReporte(id, accion) {
  const token = sessionStorage.getItem('token')
  const res = await fetch(`http://localhost:3000/api/admin/reportes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ accion })
  })

  if (res.ok) {
    await cargarDatos()
  } else {
    const data = await res.json()
    alert(data.message || 'No se pudo procesar el reporte')
  }
}

async function guardarUsuario(u) {
  const token = sessionStorage.getItem('token')
  const res = await fetch(`http://localhost:3000/api/admin/usuarios/${u.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ rol: u.rol, estado: u.estado })
  })

  if (res.ok) {
    alert('Usuario actualizado')
    await cargarDatos()
  } else {
    const data = await res.json()
    alert(data.message || 'Error al actualizar usuario')
  }
}

async function agregarCategoria() {
  const token = sessionStorage.getItem('token')
  const res = await fetch('http://localhost:3000/api/admin/categorias', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(nuevaCat)
  })

  if (res.ok) {
    nuevaCat.nombre = ''
    await cargarDatos()
  } else {
    const data = await res.json()
    alert(data.message || 'Error al crear categoría')
  }
}

async function borrarCategoria(id) {
  const token = sessionStorage.getItem('token')
  const res = await fetch(`http://localhost:3000/api/admin/categorias/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })

  if (res.ok) {
    await cargarDatos()
  } else {
    const data = await res.json()
    alert(data.message || 'No se pudo eliminar la categoría')
  }
}
</script>

<style scoped>
.admin-page { max-width: 960px; }
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.admin-header h1 { margin: 0; font-family: var(--font-display); color: var(--navy); }
.subtitle { margin: 0.25rem 0 0; color: var(--slate); font-size: 0.9rem; }
.role-badge {
  background: var(--navy);
  color: white;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.75rem;
}
.metric-card {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
}
.metric-num { font-family: var(--font-display); font-size: 1.75rem; font-weight: 700; color: var(--blue-500); }
.metric-card.warn .metric-num { color: #d97706; }
.metric-card.danger .metric-num { color: #dc3545; }
.metric-label { font-size: 0.82rem; color: var(--slate); margin-top: 0.2rem; }

.tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.25rem; }
.tab {
  padding: 0.55rem 1rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--white);
  color: var(--slate);
  font-weight: 600;
  cursor: pointer;
}
.tab.active { background: var(--blue-500); color: white; border-color: var(--blue-500); }

.panel-card {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 1.5rem;
}
.panel-card h2 { margin-top: 0; font-size: 1.15rem; color: var(--navy); }

.report-list { display: flex; flex-direction: column; gap: 0.85rem; }
.report-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 10px;
}
.report-top { display: flex; gap: 0.5rem; margin-bottom: 0.4rem; }
.type-tag { background: #e0f2fe; color: #0369a1; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 6px; }
.count-tag { background: #fee2e2; color: #b91c1c; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 6px; }
.report-content { margin: 0.25rem 0; font-weight: 500; }
.report-reason { margin: 0; font-size: 0.85rem; color: var(--slate); }
.report-actions { display: flex; gap: 0.5rem; flex: none; }

.category-bars { display: flex; flex-direction: column; gap: 0.75rem; }
.bar-row { display: grid; grid-template-columns: 180px 1fr 40px; align-items: center; gap: 0.75rem; font-size: 0.9rem; }
.bar-track { height: 10px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
.bar-fill { height: 100%; background: var(--blue-500); border-radius: 999px; transition: width 0.3s ease; }
.bar-count { font-weight: 700; text-align: right; color: var(--navy); }

.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
th, td { text-align: left; padding: 0.7rem 0.5rem; border-bottom: 1px solid var(--line); }
th { color: var(--slate); font-weight: 600; }
select, input { padding: 0.45rem 0.65rem; border: 1px solid var(--line); border-radius: 6px; font-family: var(--font-body); }

.cat-form { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-bottom: 1.25rem; }
.cat-form input:first-child { flex: 1; min-width: 200px; }
.cat-list { display: flex; flex-direction: column; gap: 0.5rem; }
.cat-item { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.85rem; border: 1px solid var(--line); border-radius: 8px; }

.btn-primary { background: var(--blue-500); color: white; border: none; padding: 0.55rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-danger { background: #dc3545; color: white; border: none; padding: 0.55rem 0.9rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-secondary { background: transparent; border: 1px solid var(--line); color: var(--slate); padding: 0.55rem 0.9rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
.sm { padding: 0.35rem 0.7rem; font-size: 0.8rem; }
.btn-primary:disabled, select:disabled { opacity: 0.5; cursor: not-allowed; }
.empty { color: var(--slate); font-size: 0.9rem; }
</style>