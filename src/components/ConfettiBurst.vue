<template>
  <span class="confetti">
    <span v-for="n in 10" :key="n" class="piece" :style="pieceStyle(n)"></span>
  </span>
</template>

<script setup>
const colors = ['#4fc3f7', '#1565c0', '#f5a623', '#2e7d32']

function pieceStyle(n) {
  const angle = (n / 10) * Math.PI * 2
  const distance = 34 + (n % 3) * 10
  const dx = Math.cos(angle) * distance
  const dy = Math.sin(angle) * distance
  return {
    '--dx': dx + 'px',
    '--dy': dy + 'px',
    background: colors[n % colors.length],
    animationDelay: n * 12 + 'ms'
  }
}
</script>

<style scoped>
.confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.piece {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  border-radius: 2px;
  transform: translate(-50%, -50%);
  animation: burst 0.6s ease-out forwards;
}
@keyframes burst {
  0% { transform: translate(-50%, -50%) translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0.4); opacity: 0; }
}
</style>
