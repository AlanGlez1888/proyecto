<template>
  <section class="auth-screen">
    <div class="card">
      <span class="brand">{{ APP_NAME }}</span>
      <p class="tagline">Crea tu cuenta con tu carrera y semestre</p>
      <form @submit.prevent="onSubmit">
        <label>
          Nombre (opcional)
          <input v-model="name" type="text" />
        </label>
        <label>
          Carrera
          <input v-model="career" type="text" required />
        </label>
        <label>
          Semestre
          <input v-model="semester" type="number" min="1" max="12" required />
        </label>
        <label>
          Correo
          <input v-model="email" type="email" required />
        </label>
        <label>
          Contraseña
          <input v-model="password" type="password" required />
        </label>
        <button type="submit">Crear cuenta</button>
      </form>
      <p class="switch">
        ¿Ya tienes cuenta? <router-link to="/">Inicia sesión</router-link>
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const name = ref('')
const career = ref('')
const semester = ref('')
const email = ref('')
const password = ref('')
const router = useRouter()

function onSubmit() {
  // Aquí se conectará con el backend (Node.js) más adelante
  console.log('Registro de prueba:', {
    name: name.value,
    career: career.value,
    semester: semester.value,
    email: email.value
  })
  router.push({ name: 'home' })
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
input:focus { border-color: var(--blue-500); }
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
.switch { margin-top: 1.25rem; font-size: 0.85rem; color: var(--slate); text-align: center; }
.switch a { color: var(--blue-500); font-weight: 500; }
</style>
