<template>
  <span class="logo" :style="{ '--size': size + 'px' }">
    <svg viewBox="0 0 120 120" class="logo-icon" role="img" aria-label="ConectaTEC">
      <defs>
        <linearGradient :id="gradId" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4fc3f7" />
          <stop offset="100%" stop-color="#1565c0" />
        </linearGradient>
      </defs>
      <path
        d="M78.5,38.6 A32,32 0 1 0 78.5,81.4"
        fill="none"
        :stroke="`url(#${gradId})`"
        stroke-width="12"
        stroke-linecap="round"
      />
      <g stroke="#1565c0" stroke-width="2.5" fill="none">
        <line x1="46" y1="60" x2="76" y2="42" />
        <line x1="46" y1="60" x2="76" y2="78" />
      </g>
      <circle cx="46" cy="60" r="7" fill="#ffffff" />
      <circle cx="76" cy="42" r="5.5" :fill="`url(#${gradId})`" />
      <circle cx="76" cy="78" r="5.5" :fill="`url(#${gradId})`" />
    </svg>
    <span v-if="withText" class="logo-text">
      Conecta<span class="logo-accent">TEC</span>
    </span>
  </span>
</template>

<script setup>
const props = defineProps({
  size: { type: Number, default: 34 },
  withText: { type: Boolean, default: true }
})
// id único por instancia para que el gradiente no choque si hay varios logos en pantalla
const gradId = `logoGrad-${Math.random().toString(36).slice(2, 9)}`
</script>

<style scoped>
.logo { display: inline-flex; align-items: center; gap: 0.5rem; }
.logo-icon { width: var(--size); height: var(--size); flex: none; }
.logo-text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: calc(var(--size) * 0.5);
  color: var(--logo-text-color, white);
  line-height: 1;
}
.logo-accent { color: var(--blue-300); }
</style>
