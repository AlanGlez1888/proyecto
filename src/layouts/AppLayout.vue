<template>
  <div class="shell">
    <TopBar />
    <div class="body">
      <LeftSidebar />
      <main class="main"><slot /></main>
      <RightSidebar />
    </div>
  </div>
</template>

<script setup>
import TopBar from '../components/TopBar.vue'
import LeftSidebar from '../components/LeftSidebar.vue'
import RightSidebar from '../components/RightSidebar.vue'
</script>

<style scoped>
.shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(900px 500px at 100% -10%, rgba(79, 195, 247, 0.08), transparent 60%),
    var(--paper);
}
.body {
  flex: 1;
  display: grid;
  grid-template-columns: 200px 1fr 240px;
}
.main { min-width: 0; }

@media (max-width: 960px) {
  .body { grid-template-columns: 200px 1fr; }
  .shell :deep(.rightbar) { display: none; }
}
@media (max-width: 680px) {
  .body { grid-template-columns: 1fr; }
  .shell :deep(.sidebar) { display: none; }
}
</style>
