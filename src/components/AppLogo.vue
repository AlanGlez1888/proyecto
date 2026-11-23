<template>
  <span class="logo" :class="{ stacked }" :style="{ '--size': size + 'px' }">
    <svg viewBox="0 0 120 120" class="logo-icon" role="img" aria-label="ConectaTEC">
      <defs>
        <!-- Gradiente para nodos (cian brillante a azul) -->
        <linearGradient :id="gradId" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00e5ff" />
          <stop offset="100%" stop-color="#0066ff" />
        </linearGradient>

        <!-- Gradiente para las líneas de conexión -->
        <linearGradient :id="`${gradId}-line`" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00d2ff" />
          <stop offset="100%" stop-color="#0055ff" />
        </linearGradient>
      </defs>

      <!-- ================= CAPA 1: FONDO (POR DETRÁS DE LA C) ================= -->
      <!-- Línea inferior: Curva más profunda y pegada al borde interior inferior -->
      <g stroke-width="3.5" stroke-linecap="round" fill="none">
        <path class="connector" d="M 12,58 Q 50,75 80,88" :stroke="`url(#${gradId}-line)`" />
      </g>

      <!-- ================= CAPA 2: LA "C" BLANCA PRINCIPAL ================= -->
      <path
        class="ring"
        d="M 82,28 A 36,36 0 1,0 80,88"
        fill="none"
        stroke="#ffffff"
        stroke-width="15"
        stroke-linecap="round"
      />

      <!-- ================= CAPA 3: FRENTE (POR DELANTE DE LA C) ================= -->
      <g stroke-width="3.5" stroke-linecap="round" fill="none">
        <!-- Línea superior: Curva en S más ceñida y sinuosa sobre el arco superior -->
        <path class="connector" d="M 12,58 C 42,42 62,38 82,28" :stroke="`url(#${gradId}-line)`" />
        
        <!-- Arco exterior derecho: Más recogido hacia los nodos derechos -->
        <path class="connector" d="M 82,28 C 92,48 90,68 80,88" :stroke="`url(#${gradId}-line)`" />
      </g>

      <!-- LOS 3 NODOS -->
      <!-- Nodo Izquierdo (Completamente fuera por la parte posterior) -->
      <circle cx="12" cy="58" r="8" :fill="`url(#${gradId})`" />

      <!-- Nodo Superior Derecho -->
      <circle cx="82" cy="28" r="8.5" :fill="`url(#${gradId})`" />

      <!-- Nodo Inferior Derecho -->
      <circle cx="80" cy="88" r="8.5" :fill="`url(#${gradId})`" />
    </svg>

    <!-- Texto ConectaTEC -->
    <span v-if="withText" class="logo-text">
      Conecta<span class="logo-accent">TEC</span>
    </span>

    <!-- Eslogan -->
    <span v-if="withTagline" class="logo-tagline">
      CONECTA · APRENDE · CRECE
    </span>
  </span>
</template>

<script setup>
defineProps({
  size: { type: Number, default: 120 },
  withText: { type: Boolean, default: true },
  withTagline: { type: Boolean, default: true },
  stacked: { type: Boolean, default: true }
})

const gradId = `logoGrad-${Math.random().toString(36).slice(2, 9)}`
</script>

<style scoped>
.logo { display: inline-flex; align-items: center; gap: 0.85rem; color: white; }
.logo.stacked { flex-direction: column; text-align: center; gap: 0.45rem; }

.logo-icon { width: var(--size); height: var(--size); flex: none; overflow: visible; }

.logo-text {
  font-family: var(--font-display, system-ui, -apple-system, sans-serif);
  font-weight: 700;
  font-size: calc(var(--size) * 0.32);
  line-height: 1;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.logo-accent { 
  color: #00a8ff; 
}

.logo-tagline {
  font-family: var(--font-body, system-ui, -apple-system, sans-serif);
  font-size: calc(var(--size) * 0.085);
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.75);
}

/* Animaciones SVG */
.logo-icon path.ring {
  stroke-dasharray: 230;
  stroke-dashoffset: 230;
  animation: drawLogo 1s ease forwards;
}

.logo-icon path.connector {
  stroke-dasharray: 160;
  stroke-dashoffset: 160;
  opacity: 0;
  animation: drawConnector 0.6s ease forwards;
  animation-delay: 0.6s;
}

.logo-icon circle {
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
  animation: popIn 0.35s ease forwards;
}

.logo-icon circle:nth-of-type(1) { animation-delay: 0.8s; }
.logo-icon circle:nth-of-type(2) { animation-delay: 0.9s; }
.logo-icon circle:nth-of-type(3) { animation-delay: 1.0s; }

@keyframes drawLogo { to { stroke-dashoffset: 0; } }
@keyframes drawConnector { from { opacity: 1; } to { stroke-dashoffset: 0; opacity: 1; } }
@keyframes popIn {
  from { opacity: 0; transform: scale(0); }
  to { opacity: 1; transform: scale(1); }
}
</style>