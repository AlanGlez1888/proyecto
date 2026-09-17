<template>
  <section class="auth-screen">
    <div class="card">
      <span class="brand">{{ APP_NAME }}</span>
      <p class="tagline">Inicia sesión para ver el muro de tu comunidad</p>
      <form @submit.prevent="onSubmit">
        <label>
          Correo
          <input v-model="correo" type="email" required />
        </label>
        <label>
          Contraseña
          <input v-model="contrasena" type="password" required />
        </label>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
      <p class="switch">
        ¿No tienes cuenta? <router-link to="/registro">Regístrate</router-link>
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { APP_NAME } from '../config.js'

// Variables del formulario (coinciden con el template)
const correo = ref('')
const contrasena = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

async function onSubmit() {
  error.value = ''
  loading.value = true

  try {
    // Hacemos la petición al backend
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        correo: correo.value,        
        contrasena: contrasena.value 
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error al iniciar sesión')
    }

    // Guardamos el token y el usuario en localStorage
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    // Redirigimos según el rol (opcional)
    if (data.user.rol === 'Administrador') {
      router.push({ name: 'admin' }) // Asumiendo que tienes esta ruta
    } else {
      router.push({ name: 'home' })
    }

  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
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
input {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-family: var(--font-body);
}
input:focus { border-color: var(--blue-500); outline: none; }
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
.error { color: #c0392b; font-size: 0.85rem; margin: 0; }
.switch { margin-top: 1.25rem; font-size: 0.85rem; color: var(--slate); text-align: center; }
.switch a { color: var(--blue-500); font-weight: 500; }
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>