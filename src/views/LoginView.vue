<template>
  <section class="auth-screen">
    <span class="blob blob-a"></span>
    <span class="blob blob-b"></span>

    <div class="hero">
      <AppLogo :size="76" stacked with-tagline />
    </div>

    <div class="card">
      <h1 class="card-title">Inicia sesión</h1>
      <p class="tagline">Entra para ver el muro de tu comunidad</p>
      <form @submit.prevent="onSubmit">
        <label>
          Correo
          <input v-model="email" type="email" required />
        </label>
        <label>
          Contraseña
          <input v-model="password" type="password" required />
        </label>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit">Entrar</button>
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
import AppLogo from '../components/AppLogo.vue'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

function onSubmit() {
  // Aquí se conectará con el backend (Node.js) más adelante
  error.value = ''
  router.push({ name: 'home' })
}
</script>

<style scoped>
.auth-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.75rem;
  background: linear-gradient(160deg, var(--navy) 0%, var(--blue-500) 65%, var(--blue-300) 130%);
  padding: 2rem 1.5rem;
  position: relative;
  overflow: hidden;
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.3;
  pointer-events: none;
}
.blob-a {
  width: 280px;
  height: 280px;
  background: #ffffff;
  top: -70px;
  left: -70px;
  animation: floatA 9s ease-in-out infinite alternate;
}
.blob-b {
  width: 340px;
  height: 340px;
  background: var(--blue-300);
  bottom: -110px;
  right: -90px;
  animation: floatB 11s ease-in-out infinite alternate;
}
@keyframes floatA {
  from { transform: translate(0, 0); }
  to { transform: translate(35px, 25px); }
}
@keyframes floatB {
  from { transform: translate(0, 0); }
  to { transform: translate(-28px, -18px); }
}
.hero {
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.35s ease both;
}
.card {
  position: relative;
  z-index: 1;
  background: var(--white);
  border-radius: 16px;
  padding: 2.25rem 2.25rem 2rem;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 20px 50px rgba(13, 27, 62, 0.3);
  animation: fadeInUp 0.35s ease 0.1s both;
}
.card-title { font-size: 1.3rem; }
.tagline { color: var(--slate); margin: 0.35rem 0 1.75rem; font-size: 0.9rem; }
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
  transition: background 0.15s ease, transform 0.1s ease;
}
button:hover { background: var(--navy-soft); }
button:active { transform: scale(0.97); }
.error { color: #c0392b; font-size: 0.85rem; margin: 0; }
.switch { margin-top: 1.25rem; font-size: 0.85rem; color: var(--slate); text-align: center; }
.switch a { color: var(--blue-500); font-weight: 500; }
</style>
