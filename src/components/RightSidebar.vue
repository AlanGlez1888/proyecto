<template>
  <aside class="rightbar">
    <div class="section-head">
      <h3>Amigos</h3>
      <router-link to="/amigos" class="see-all">Ver todos</router-link>
    </div>
    <ul class="friends">
      <li
        v-for="(f, i) in friends.slice(0, 5)" :key="f.id"
        :style="{ animationDelay: (i * 60) + 'ms' }"
      >
        <span class="dot" :class="{ online: f.online }"></span>
        <span class="fname">{{ f.name }}</span>
      </li>
    </ul>

    <div class="section-head">
      <h3>Chats</h3>
      <router-link to="/mensajes" class="see-all">Ver todos</router-link>
    </div>
    <ul class="chats">
      <li
        v-for="(c, i) in chats" :key="c.id" class="chat-item"
        :style="{ animationDelay: (i * 60 + 100) + 'ms' }"
        @click="openChat(c.id)"
      >
        <div class="chat-row">
          <span class="cname">{{ c.name }}</span>
          <transition name="pop">
            <span v-if="c.unread" class="badge">{{ c.unread }}</span>
          </transition>
        </div>
        <span class="preview">{{ lastMessage(c) }}</span>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { friends, chats } from '../data/mockData.js'

const router = useRouter()

function lastMessage(chat) {
  const last = chat.messages[chat.messages.length - 1]
  return last ? last.text : ''
}

function openChat(id) {
  router.push({ path: '/mensajes', query: { chat: id } })
}
</script>

<style scoped>
.rightbar { padding: 1.5rem 1rem; border-left: 1px solid var(--line); }
.section-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.6rem; }
.section-head:not(:first-child) { margin-top: 0.25rem; }
h3 { font-family: var(--font-body); font-size: 0.8rem; font-weight: 600; color: var(--slate); margin: 0; }
.see-all {
  font-size: 0.75rem;
  color: var(--blue-500);
  text-decoration: none;
  font-weight: 600;
  position: relative;
}
.see-all::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 1px;
  background: var(--blue-500);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.2s ease;
}
.see-all:hover::after { transform: scaleX(1); transform-origin: left; }
.friends, .chats {
  list-style: none;
  padding: 0;
  margin: 0 0 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.friends li { display: flex; align-items: center; gap: 0.6rem; font-size: 0.88rem; animation: fadeInUp 0.35s ease both; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--line); flex: none; }
.dot.online { background: #2e7d32; animation: pulseDot 1.8s ease-in-out infinite; }
@keyframes pulseDot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.45); }
  50% { box-shadow: 0 0 0 4px rgba(46, 125, 50, 0); }
}
.chat-item {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
  padding: 0.4rem;
  margin: 0 -0.4rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
  animation: fadeInUp 0.35s ease both;
}
.chat-item:hover { background: var(--paper); }
.chat-item:active { transform: scale(0.98); }
.chat-row { display: flex; justify-content: space-between; align-items: center; }
.cname { font-weight: 600; }
.preview { color: var(--slate); font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.badge {
  background: var(--amber);
  color: white;
  font-size: 0.68rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 0.05rem 0.45rem;
  animation: badgePulse 1.4s ease-in-out infinite;
}
@keyframes badgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.12); }
}
.pop-enter-active { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-leave-active { transition: all 0.2s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: scale(0.4); }
</style>
