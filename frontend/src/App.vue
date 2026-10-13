<template>
  <!-- Si NO requiere autenticación (Login/Registro), mostramos solo el router-view limpio -->
  <router-view v-if="!isProtectedRoute" v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>

  <!-- Si SÍ requiere autenticación (Feed, Perfil), envolvemos con AppLayout (Sidebars) -->
  <AppLayout v-else>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </AppLayout>
  
  <ToastHost />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from './layouts/AppLayout.vue'
import ToastHost from './components/ToastHost.vue'

const route = useRoute()

// Comprobamos si la ruta actual tiene el meta requiresAuth que configuramos en el router
const isProtectedRoute = computed(() => route.meta?.requiresAuth === true)
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>