<template>
  <ProgressBar />

  <router-view v-if="isAuthPage" v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <AppLayout v-else>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </AppLayout>

  <ScrollTopButton v-if="!isAuthPage" />
  <ToastHost />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from './layouts/AppLayout.vue'
import ToastHost from './components/ToastHost.vue'
import ProgressBar from './components/ProgressBar.vue'
import ScrollTopButton from './components/ScrollTopButton.vue'

const route = useRoute()
const isAuthPage = computed(() => route.meta?.auth === true)
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
