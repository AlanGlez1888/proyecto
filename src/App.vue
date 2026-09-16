<template>
  <router-view v-if="isAuthPage" />
  <AppLayout v-else>
    <router-view />
  </AppLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from './layouts/AppLayout.vue'

const route = useRoute()
const isAuthPage = computed(() => route.meta?.auth === true)
</script>
