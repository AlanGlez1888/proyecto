<template>
  <section class="messages-page">
    <aside class="conv-list">
      <h1>Mensajes</h1>
      <ul>
        <li
          v-for="(c, i) in chats" :key="c.id"
          class="conv-item" :class="{ active: c.id === activeId }"
          :style="{ animationDelay: (i * 50) + 'ms' }"
          @click="selectChat(c.id)"
        >
          <span class="avatar" :style="{ background: colorForSubject(c.name) }">{{ initialsFor(c.name) }}</span>
          <span class="info">
            <span class="cname">{{ c.name }}</span>
            <span class="preview">{{ lastMessage(c) }}</span>
          </span>
          <transition name="pop">
            <span v-if="c.unread" class="badge">{{ c.unread }}</span>
          </transition>
        </li>
      </ul>
    </aside>

    <div class="thread" v-if="activeChat">
      <transition name="thread-fade" mode="out-in">
        <div :key="activeChat.id" class="thread-inner">
          <header class="thread-header">
            <span class="avatar" :style="{ background: colorForSubject(activeChat.name) }">
              {{ initialsFor(activeChat.name) }}
            </span>
            <span class="tname">{{ activeChat.name }}</span>
          </header>

          <div class="bubble-list" ref="bubbleListEl">
            <div
              v-for="(m, i) in activeChat.messages" :key="m.id"
              class="bubble" :class="m.from"
              :style="{ animationDelay: Math.min(i * 45, 450) + 'ms' }"
            >
              <p>{{ m.text }}</p>
              <span class="time">{{ m.time }}</span>
            </div>
            <div v-if="typing" class="bubble them typing">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
          </div>

          <form class="composer" @submit.prevent="send">
            <input v-model="draft" type="text" placeholder="Escribe un mensaje..." />
            <button type="submit" class="send-btn" :class="{ sent: justSent }" :disabled="!draft.trim()">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 3L3 9.5l6 2.5m8-9l-3.5 13-4.5-4m8-9l-8 9" />
              </svg>
            </button>
          </form>
        </div>
      </transition>
    </div>
    <div class="thread empty" v-else>
      <EmptyState message="Selecciona una conversación para empezar a chatear." />
    </div>
  </section>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chats } from '../data/mockData.js'
import { colorForSubject, initialsFor } from '../utils/subjectColor.js'
import EmptyState from '../components/EmptyState.vue'

const route = useRoute()
const router = useRouter()

const activeId = ref(null)
const draft = ref('')
const typing = ref(false)
const justSent = ref(false)
const bubbleListEl = ref(null)

const activeChat = computed(() => chats.find(c => c.id === activeId.value) || null)

function lastMessage(chat) {
  const last = chat.messages[chat.messages.length - 1]
  return last ? last.text : ''
}

function scrollToBottom() {
  if (bubbleListEl.value) bubbleListEl.value.scrollTop = bubbleListEl.value.scrollHeight
}

function selectChat(id) {
  activeId.value = id
  const chat = chats.find(c => c.id === id)
  if (chat) chat.unread = 0
  router.replace({ query: { chat: id } })
  nextTick(scrollToBottom)
}

function currentTime() {
  const d = new Date()
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}

const REPLIES = [
  'Va, gracias por avisar.',
  'Ah perfecto, ahorita lo checo.',
  'Sale, igual ando en eso.',
  'Nos vemos en clase entonces.'
]

function send() {
  if (!draft.value.trim() || !activeChat.value) return
  activeChat.value.messages.push({ id: Date.now(), from: 'me', text: draft.value.trim(), time: currentTime() })
  draft.value = ''
  justSent.value = true
  setTimeout(() => { justSent.value = false }, 300)
  nextTick(scrollToBottom)

  typing.value = true
  nextTick(scrollToBottom)
  setTimeout(() => {
    typing.value = false
    activeChat.value.messages.push({
      id: Date.now() + 1,
      from: 'them',
      text: REPLIES[Math.floor(Math.random() * REPLIES.length)],
      time: currentTime()
    })
    nextTick(scrollToBottom)
  }, 1300)
}

onMounted(() => {
  const q = route.query.chat
  const initialId = q ? Number(q) : chats[0]?.id
  if (initialId) selectChat(initialId)
})
</script>

<style scoped>
.messages-page {
  display: grid;
  grid-template-columns: 260px 1fr;
  height: calc(100vh - 62px);
}
.conv-list {
  border-right: 1px solid var(--line);
  padding: 1.25rem 1rem;
  overflow-y: auto;
}
.conv-list h1 { font-size: 1.15rem; margin-bottom: 1rem; }
.conv-list ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.3rem; }
.conv-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.55rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s ease;
  animation: fadeInUp 0.3s ease both;
}
.conv-item:hover { background: var(--paper); }
.conv-item.active { background: rgba(21, 101, 192, 0.1); }
.conv-item.active::before {
  content: '';
  position: absolute;
  left: -0.4rem;
  top: 50%;
  width: 3px;
  height: 60%;
  border-radius: 2px;
  background: var(--blue-500);
  transform: translateY(-50%);
}
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.8rem;
  flex: none;
}
.info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.cname { font-weight: 600; font-size: 0.9rem; }
.preview { font-size: 0.78rem; color: var(--slate); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.badge {
  background: var(--amber);
  color: white;
  font-size: 0.68rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 0.05rem 0.45rem;
  flex: none;
}

.thread { display: flex; flex-direction: column; min-width: 0; }
.thread.empty { align-items: center; justify-content: center; }
.thread-inner { display: flex; flex-direction: column; height: 100%; }
.thread-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--line);
}
.tname { font-weight: 700; color: var(--heading); }

.bubble-list {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.bubble {
  max-width: 65%;
  padding: 0.55rem 0.85rem;
  border-radius: 14px;
  font-size: 0.9rem;
  line-height: 1.4;
  position: relative;
}
.bubble p { margin: 0; }
.bubble .time { display: block; font-size: 0.68rem; margin-top: 0.2rem; opacity: 0.7; }
.bubble.them {
  align-self: flex-start;
  background: var(--white);
  border: 1px solid var(--line);
  color: var(--ink);
  border-bottom-left-radius: 4px;
  animation: bubbleInThem 0.28s ease both;
}
.bubble.me {
  align-self: flex-end;
  background: var(--blue-500);
  color: white;
  border-bottom-right-radius: 4px;
  animation: bubbleInMe 0.28s ease both;
}
@keyframes bubbleInThem {
  from { opacity: 0; transform: translate(-10px, 6px) scale(0.94); }
  to { opacity: 1; transform: translate(0, 0) scale(1); }
}
@keyframes bubbleInMe {
  from { opacity: 0; transform: translate(10px, 6px) scale(0.94); }
  to { opacity: 1; transform: translate(0, 0) scale(1); }
}
.bubble.typing { display: flex; gap: 3px; align-items: center; padding: 0.7rem 0.9rem; }
.bubble.typing .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--slate-light);
  animation: typingBounce 1s infinite ease-in-out;
}
.bubble.typing .dot:nth-child(2) { animation-delay: 0.15s; }
.bubble.typing .dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

.composer {
  display: flex;
  gap: 0.6rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--line);
}
.composer input {
  flex: 1;
  padding: 0.65rem 1rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 0.9rem;
}
.composer input:focus { border-color: var(--blue-500); }
.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--blue-500);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: none;
  transition: background 0.15s ease, transform 0.15s ease;
}
.send-btn svg { width: 17px; height: 17px; }
.send-btn:disabled { background: var(--line); color: var(--slate-light); cursor: not-allowed; }
.send-btn:not(:disabled):hover { background: var(--navy-soft); }
.send-btn.sent { animation: sendPop 0.3s ease; }
@keyframes sendPop {
  0% { transform: scale(1) rotate(0); }
  40% { transform: scale(0.8) rotate(-15deg) translate(6px, -6px); opacity: 0.6; }
  100% { transform: scale(1) rotate(0) translate(0, 0); opacity: 1; }
}

.thread-fade-enter-active, .thread-fade-leave-active { transition: opacity 0.15s ease; }
.thread-fade-enter-from, .thread-fade-leave-to { opacity: 0; }

.pop-enter-active { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-leave-active { transition: all 0.2s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: scale(0.4); }

@media (max-width: 760px) {
  .messages-page { grid-template-columns: 1fr; }
  .conv-list { display: none; }
}
</style>
