<template>
  <section class="page" v-if="usuario">
    <div class="banner"></div>
    <div class="header">
      <span class="avatar-lg">{{ initials }}</span>
      <div>
        <h1>{{ fullName }}</h1>
        <p class="career">{{ form.career }} · {{ form.semester }}° semestre</p>
      </div>
    </div>

    <div class="stats">
      <div class="stat">
        <span class="num">{{ animatedPosts }}</span>
        <span class="label">Opiniones publicadas</span>
      </div>
      <div class="stat">
        <span class="num">{{ animatedItems }}</span>
        <span class="label">Artículos en marketplace</span>
      </div>
      <div class="stat">
        <span class="num">{{ avgRating }}</span>
        <span class="label">Calificación promedio dada</span>
      </div>
    </div>

    <div v-if="badges.length" class="badges">
      <h2>Logros</h2>
      <div class="badge-row">
        <div v-for="b in badges" :key="b.label" class="badge-chip">
          <span class="badge-title">{{ b.label }}</span>
          <span class="badge-desc">{{ b.desc }}</span>
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="card">
        <template v-if="!editing">
          <dl>
            <div class="row">
              <dt>Nombre</dt>
              <dd>{{ fullName }}</dd>
            </div>
            <div class="row">
              <dt>Carrera</dt>
              <dd>{{ form.career }}</dd>
            </div>
            <div class="row">
              <dt>Semestre</dt>
              <dd>{{ form.semester }}°</dd>
            </div>
            <div class="row">
              <dt>Correo</dt>
              <dd>{{ form.email }}</dd>
            </div>
          </dl>
          <button class="edit" @click="startEditing">Editar perfil</button>
          <button class="logout" @click="logout">Cerrar sesión</button>
        </template>

        <form v-else @submit.prevent="save">
          <label>Nombre <input v-model="form.nombre" type="text" required /></label>
          <label>Apellido Paterno <input v-model="form.apellido_paterno" type="text" /></label>
          <label>Apellido Materno <input v-model="form.apellido_materno" type="text" /></label>
          <label>
            Carrera
            <select v-model.number="form.id_carrera" required>
              <option v-for="c in carreras" :key="c.id" :value="c.id">
                {{ c.nombre }}
              </option>
            </select>
          </label>
          <label>Semestre <input v-model.number="form.semester" type="number" min="1" max="12" required /></label>
          <label>Correo <input v-model="form.email" type="email" required /></label>

          <p v-if="errorMsg" style="color: #dc3545; font-size: 0.85rem; margin: 0;">{{ errorMsg }}</p>

          <div class="actions">
            <button type="submit" class="save" :disabled="saving">
              {{ saving ? 'Guardando...' : 'Guardar cambios' }}
            </button>
            <button type="button" class="cancel" @click="cancel">Cancelar</button>
          </div>
        </form>
      </div>

      <div class="activity">
        <h2>Mis publicaciones</h2>
        <PostCard v-for="post in myPosts" :key="post.id" :post="post" />
        <EmptyState v-if="myPosts.length === 0" message="Aún no has publicado opiniones." />

        <h2>Mis artículos en marketplace</h2>
        <div class="mini-items">
          <div v-for="item in myItems" :key="item.id" class="mini-item">
            <span class="dot" :style="{ background: colorForSubject(item.subject) }"></span>
            <div class="item-info">
              <span class="title">{{ item.title }}</span>
              <span v-if="item.location" class="location">· {{ item.location }}</span>
            </div>
            <span class="price">
              {{ item.type === 'venta' ? `$${item.price}` : 'Renta' }}
            </span>
            <button type="button" class="btn-delete-item" title="Eliminar artículo" @click="deleteItem(item.id)">
              Eliminar
            </button>
          </div>
        </div>
        <EmptyState v-if="myItems.length === 0" message="Aún no has publicado artículos." />
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PostCard from '../components/PostCard.vue'
import EmptyState from '../components/EmptyState.vue'

import { posts } from '../data/mockData.js'
import { initialsFor, colorForSubject } from '../utils/subjectColor.js'
// import { useToast } from '../composables/useToast.js'

// const { show } = useToast()
const router = useRouter()

const usuario = ref(null)
const editing = ref(false)
const saving = ref(false)
const errorMsg = ref('')
const carreras = ref([])
let backupForm = {}

const form = reactive({
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  id_carrera: '',
  career: 'Cargando...',
  semester: 1,
  email: ''
})

// Artículos reales desde MySQL
const myItems = ref([])

// Combina nombre y apellidos dinámicamente
const fullName = computed(() =>
  `${form.nombre} ${form.apellido_paterno} ${form.apellido_materno}`.trim() || 'Alumno'
)

const initials = computed(() => (initialsFor ? initialsFor(fullName.value) : '??'))

// Filtrado temporal de opiniones con mockData (siguiente paso: conectar a MySQL)
const myPosts = computed(() => (posts ? posts.filter(p => p.author === fullName.value && !p.anonymous) : []))

const avgRating = computed(() => {
  if (myPosts.value.length === 0) return '—'
  const total = myPosts.value.reduce((sum, p) => sum + p.rating, 0)
  return (total / myPosts.value.length).toFixed(1)
})

const badges = computed(() => {
  const list = []
  if (myPosts.value.length >= 1) list.push({ label: 'Primera opinión', desc: 'Publicaste tu primera opinión sobre un maestro' })
  if (myPosts.value.length >= 3) list.push({ label: 'Voz activa', desc: 'Ya llevas 3 o más opiniones publicadas' })
  if (myItems.value.length >= 1) list.push({ label: 'Emprendedor', desc: 'Publicaste tu primer artículo en el marketplace' })
  return list
})

const animatedPosts = ref(0)
const animatedItems = ref(0)

function animateValue(targetRef, target, duration = 600) {
  const start = performance.now()
  function step(now) {
    const progress = Math.min((now - start) / duration, 1)
    targetRef.value = Math.round(progress * target)
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

onMounted(async () => {
  const userData = sessionStorage.getItem('user')
  const token = sessionStorage.getItem('token')

  if (!userData || !token) {
    router.push('/')
    return
  }

  usuario.value = JSON.parse(userData)
  form.email = usuario.value.correo || ''

  try {
    const [perfilRes, carrerasRes, itemsRes] = await Promise.all([
      fetch('http://localhost:3000/api/users/perfil', {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch('http://localhost:3000/api/users/carreras'),
      fetch('http://localhost:3000/api/users/mis-publicaciones', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ])

    if (carrerasRes.ok) {
      const listaCarreras = await carrerasRes.json()
      carreras.value = listaCarreras.map(c => ({
        id: Number(c.id),
        nombre: c.nombre
      }))
    }

    if (itemsRes.ok) {
      myItems.value = await itemsRes.json()
    }

    if (perfilRes.ok) {
      const datosPerfil = await perfilRes.json()
      form.nombre = datosPerfil.nombre || ''
      form.apellido_paterno = datosPerfil.apellido_paterno || ''
      form.apellido_materno = datosPerfil.apellido_materno || ''
      form.id_carrera = Number(datosPerfil.id_carrera)
      form.career = datosPerfil.carrera || 'Carrera no registrada'
      form.semester = Number(datosPerfil.semestre)
      form.email = datosPerfil.correo || ''
    } else {
      logout()
      return
    }
  } catch (error) {
    console.error('Error al cargar la info del perfil:', error)
  }

  animateValue(animatedPosts, myPosts.value.length)
  animateValue(animatedItems, myItems.value.length)
})

function startEditing() {
  errorMsg.value = ''
  backupForm = { ...form }
  editing.value = true
}

function cancel() {
  Object.assign(form, backupForm)
  errorMsg.value = ''
  editing.value = false
}

async function save() {
  const token = sessionStorage.getItem('token')
  saving.value = true
  errorMsg.value = ''

  try {
    const response = await fetch('http://localhost:3000/api/users/perfil', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nombre: form.nombre,
        apellido_paterno: form.apellido_paterno,
        apellido_materno: form.apellido_materno,
        id_carrera: Number(form.id_carrera),
        semestre: Number(form.semester),
        correo: form.email
      })
    })

    const data = await response.json()

    if (!response.ok) {
      errorMsg.value = data.message || 'No se pudo actualizar el perfil'
      return
    }

    const carreraSeleccionada = carreras.value.find(c => c.id === Number(form.id_carrera))
    if (carreraSeleccionada) {
      form.career = carreraSeleccionada.nombre
    }

    const updatedUser = {
      ...usuario.value,
      correo: form.email,
      nombreCompleto: `${form.nombre} ${form.apellido_paterno}`.trim()
    }
    sessionStorage.setItem('user', JSON.stringify(updatedUser))
    usuario.value = updatedUser

    editing.value = false
    // show('Perfil actualizado')
  } catch (error) {
    console.error('Error al guardar cambios:', error)
    errorMsg.value = 'Error de conexión con el servidor'
  } finally {
    saving.value = false
  }
}

async function deleteItem(id) {
  const token = sessionStorage.getItem('token')
  try {
    const response = await fetch(`http://localhost:3000/api/users/publicaciones/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const data = await response.json()

    if (response.ok) {
      myItems.value = myItems.value.filter(item => item.id !== id)
      animatedItems.value = myItems.value.length
    } else {
      alert(data.message || 'No se pudo eliminar el artículo')
    }
  } catch (error) {
    console.error('Error al eliminar artículo:', error)
    alert('Error de conexión con el servidor')
  }
}

function logout() {
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('user')
  router.push('/')
}
</script>

<style scoped>
.page {
  max-width: 880px;
}

.banner {
  height: 110px;
  border-radius: 14px;
  background: linear-gradient(120deg, var(--blue-300), var(--blue-500) 60%, var(--navy));
  margin-bottom: -40px;
}

.header {
  display: flex;
  align-items: flex-end;
  gap: 1.25rem;
  padding: 0 0.5rem;
  margin-bottom: 1.5rem;
}

.avatar-lg {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: var(--white);
  color: var(--blue-500);
  border: 4px solid var(--white);
  box-shadow: 0 4px 14px rgba(13, 27, 62, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.5rem;
  flex: none;
}

.career {
  color: var(--slate);
  margin-top: 0.2rem;
}

.stats {
  display: flex;
  gap: 2.5rem;
  padding: 1rem 0.5rem 1.5rem;
  border-bottom: 1px solid var(--line);
  margin-bottom: 1.75rem;
}

.stat {
  display: flex;
  flex-direction: column;
}

.num {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.6rem;
  color: var(--blue-500);
}

.label {
  font-size: 0.78rem;
  color: var(--slate);
  margin-top: 0.15rem;
}

.badges {
  margin-bottom: 1.75rem;
}

.badges h2 {
  margin-top: 0;
}

.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.badge-chip {
  background: linear-gradient(135deg, rgba(79, 195, 247, 0.14), rgba(21, 101, 192, 0.08));
  border: 1px solid rgba(21, 101, 192, 0.18);
  border-radius: 10px;
  padding: 0.7rem 1rem;
  min-width: 190px;
}

.badge-title {
  display: block;
  font-weight: 700;
  color: var(--navy);
  font-size: 0.88rem;
}

.badge-desc {
  display: block;
  font-size: 0.76rem;
  color: var(--slate);
  margin-top: 0.2rem;
}

.columns {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  align-items: start;
}

.card {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 1.5rem;
}

dl {
  margin: 0 0 1.25rem;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid var(--line);
  font-size: 0.92rem;
}

dt {
  color: var(--slate);
  margin: 0;
}

dd {
  margin: 0;
  font-weight: 500;
  word-break: break-all;
  text-align: right;
  max-width: 185px;
}

.edit {
  padding: 0.6rem 1.1rem;
  border: none;
  border-radius: 8px;
  background: var(--blue-500);
  color: white;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
}

.edit:hover {
  background: var(--navy-soft);
}

.logout {
  margin-top: 0.8rem;
  padding: 0.6rem 1.1rem;
  border: 1px solid #dc3545;
  border-radius: 8px;
  background: transparent;
  color: #dc3545;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;
}

.logout:hover {
  background: #dc3545;
  color: white;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.88rem;
  color: var(--slate);
}

input,
select {
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-family: var(--font-body);
}

.actions {
  display: flex;
  gap: 0.75rem;
}

.save {
  background: var(--blue-500);
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.save:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.cancel {
  background: transparent;
  border: 1px solid var(--line);
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  color: var(--slate);
}

.activity h2 {
  margin-top: 0;
}

.mini-items {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
}

.mini-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--white);
  font-size: 0.88rem;
}

.mini-item .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}

.item-info {
  flex: 1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  min-width: 0;
}

.mini-item .title {
  font-weight: 500;
}

.mini-item .location {
  font-size: 0.78rem;
  color: var(--slate);
}

.mini-item .price {
  color: var(--navy);
  font-weight: 600;
  white-space: nowrap;
}

.btn-delete-item {
  background: transparent;
  border: 1px solid #dc3545;
  color: #dc3545;
  border-radius: 6px;
  padding: 0.25rem 0.55rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: none;
}

.btn-delete-item:hover {
  background: #dc3545;
  color: white;
}

.empty {
  color: var(--slate);
  font-size: 0.88rem;
}

@media (max-width: 760px) {
  .columns {
    grid-template-columns: 1fr;
  }
}
</style>