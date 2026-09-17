<template>
  <section class="auth-screen">
    <div class="card">
      <span class="brand">{{ APP_NAME }}</span>
      <p class="tagline">Crea tu cuenta con tu carrera y semestre</p>
      
      <form @submit.prevent="onSubmit">
        <label>
          Nombre
          <input v-model="form.nombre" type="text" required />
        </label>
        <label>
          Apellido Paterno
          <input v-model="form.apellido_paterno" type="text" required />
        </label>
        <label>
          Apellido Materno
          <input v-model="form.apellido_materno" type="text" />
        </label>

        <!-- Seleccionar carrera -->
        <label>
          Carrera
          <select v-model.number="form.id_carrera" required>
            <option value="" disabled>Selecciona tu carrera</option>
            <!-- Si carreras está vacío, mostramos un mensaje de carga -->
            <option v-if="cargandoCarreras" disabled>Cargando carreras...</option>
            <option v-for="c in carreras" :key="c.id" :value="c.id">
              {{ c.nombre }}
            </option>
          </select>
        </label>
        
        <!-- Seleccionar semestre -->
        <label>
          Semestre
          <input v-model.number="form.semestre" type="number" min="1" max="12" required />
        </label>
        
        <label>
          Correo
          <input v-model="form.correo" type="email" required />
        </label>
        <label>
          Contraseña
          <input v-model="form.contraseña" type="password" required />
        </label>

        <!-- Mensajes de estado -->
        <p v-if="mensaje" :class="['status-msg', esError ? 'error' : 'success']">
          {{ mensaje }}
        </p>

        <button type="submit" :disabled="cargando">
          {{ cargando ? 'Creando cuenta...' : 'Crear cuenta' }}
        </button>
      </form>

      <p class="switch">
        ¿Ya tienes cuenta? <router-link to="/">Inicia sesión</router-link>
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue' // <-- Agregamos onMounted
import { useRouter } from 'vue-router'

const router = useRouter()
const APP_NAME = 'RedSocialProfes'

const form = ref({
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  id_carrera: '',
  semestre: '',
  correo: '',
  contraseña: ''
})

// Variables para las carreras
const carreras = ref([])       // <-- Aquí se guardan las carreras del backend
const cargandoCarreras = ref(true) // <-- Para mostrar estado de carga

const mensaje = ref('')
const esError = ref(false)
const cargando = ref(false)

// Cargar las carreras al montar el componente
onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/carreras')
    if (response.ok) {
      carreras.value = await response.json()
      console.log('Carreras cargadas:', carreras.value) // Para depurar
    } else {
      console.error('Error al obtener carreras:', response.status)
    }
  } catch (error) {
    console.error('Error de red al cargar carreras:', error)
  } finally {
    cargandoCarreras.value = false
  }
})

async function onSubmit() {
  mensaje.value = ''
  cargando.value = true

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })

    const data = await response.json()

    if (!response.ok) {
      esError.value = true
      mensaje.value = data.message || 'Error al registrar la cuenta.'
    } else {
      esError.value = false
      mensaje.value = '¡Cuenta creada exitosamente! Redirigiendo...'

      setTimeout(() => {
        router.push('/')
      }, 1500)
    }
  } catch (error) {
    console.error('Error de red:', error)
    esError.value = true
    mensaje.value = 'No se pudo conectar con el servidor backend.'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.auth-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--blue-300), var(--blue-500) 55%, var(--navy));
  padding: 1.5rem;
}
.card {
  background: var(--white);
  border-radius: 16px;
  padding: 2.5rem 2.25rem;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 20px 50px rgba(13, 27, 62, 0.25);
}
.brand {
  display: block;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.6rem;
  color: var(--navy);
}
.tagline { color: var(--slate); margin: 0.4rem 0 1.75rem; font-size: 0.9rem; }
form { display: flex; flex-direction: column; gap: 1rem; }
label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.88rem; color: var(--slate); }
input, select {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-family: var(--font-body);
}
input:focus, select:focus { border-color: var(--blue-500); outline: none; }
button {
  padding: 0.7rem;
  background: var(--blue-500);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.25rem;
}
button:hover { background: var(--navy-soft); }
button:disabled { opacity: 0.6; cursor: not-allowed; }

.switch { margin-top: 1.25rem; font-size: 0.85rem; color: var(--slate); text-align: center; }
.switch a { color: var(--blue-500); font-weight: 500; }

.status-msg { font-size: 0.85rem; text-align: center; margin: 0; }
.status-msg.error { color: #dc3545; }
.status-msg.success { color: #198754; }
</style>