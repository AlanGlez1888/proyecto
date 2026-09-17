<template>
  <aside class="rightbar">
    <div class="section-head">
      <h3>Amigos</h3>
      <router-link to="/amigos" class="see-all">Ver todos</router-link>
    </div>
    <ul class="friends">
      <li v-for="f in friends.slice(0, 5)" :key="f.id">
        <span class="dot" :class="{ online: f.online }"></span>
        <span class="fname">{{ f.name }}</span>
      </li>
    </ul>

    <h3>Chats</h3>
    <ul class="chats">
      <li v-for="c in chats" :key="c.id">
        <div class="chat-row">
          <span class="cname">{{ c.name }}</span>
          <span v-if="c.unread" class="badge">{{ c.unread }}</span>
        </div>
        <span class="preview">{{ c.preview }}</span>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { friends, chats } from '../data/mockData.js'
</script>

<style scoped>
.rightbar { padding: 1.5rem 1rem; border-left: 1px solid var(--line); }
.section-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.6rem; }
h3 { font-family: var(--font-body); font-size: 0.8rem; font-weight: 600; color: var(--slate); margin: 0; }
.see-all { font-size: 0.75rem; color: var(--blue-500); text-decoration: none; font-weight: 600; }
.friends, .chats {
  list-style: none;
  padding: 0;
  margin: 0 0 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.friends li { display: flex; align-items: center; gap: 0.6rem; font-size: 0.88rem; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--line); flex: none; }
.dot.online { background: #2e7d32; }
.chats li { display: flex; flex-direction: column; font-size: 0.85rem; }
.chat-row { display: flex; justify-content: space-between; align-items: center; }
.cname { font-weight: 600; }
.preview { color: var(--slate); font-size: 0.8rem; }
.badge {
  background: var(--amber);
  color: white;
  font-size: 0.68rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 0.05rem 0.45rem;
}
</style>
