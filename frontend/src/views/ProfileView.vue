<template>
  <section class="page">
    <div class="banner"></div>
    <div class="header">
      <span class="avatar-lg">{{ initials }}</span>
      <div>
        <h1>{{ form.name }}</h1>
        <p class="career">{{ form.career }} · {{ form.semester }}° semestre</p>
      </div>
    </div>

    <div class="stats">
      <div class="stat">
        <span class="num">{{ myPosts.length }}</span>
        <span class="label">Opiniones publicadas</span>
      </div>
      <div class="stat">
        <span class="num">{{ myItems.length }}</span>
        <span class="label">Artículos en marketplace</span>
      </div>
      <div class="stat">
        <span class="num">{{ avgRating }}</span>
        <span class="label">Calificación promedio dada</span>
      </div>
    </div>

    <div class="columns">
      <div class="card">
        <template v-if="!editing">
          <dl>
            <div class="row"><dt>Nombre</dt><dd>{{ form.name }}</dd></div>
            <div class="row"><dt>Carrera</dt><dd>{{ form.career }}</dd></div>
            <div class="row"><dt>Semestre</dt><dd>{{ form.semester }}</dd></div>
            <div class="row"><dt>Correo</dt><dd>{{ form.email }}</dd></div>
          </dl>
          <button class="edit" @click="editing = true">Editar perfil</button>
        </template>

        <form v-else @submit.prevent="save">
          <label>Nombre <input v-model="form.name" type="text" /></label>
          <label>Carrera <input v-model="form.career" type="text" /></label>
          <label>Semestre <input v-model="form.semester" type="number" min="1" max="12" /></label>
          <label>Correo <input v-model="form.email" type="email" /></label>
          <div class="actions">
            <button type="submit" class="save">Guardar cambios</button>
            <button type="button" class="cancel" @click="cancel">Cancelar</button>
          </div>
        </form>
      </div>

      <div class="activity">
        <h2>Mis publicaciones</h2>
        <PostCard v-for="post in myPosts" :key="post.id" :post="post" />
        <p v-if="myPosts.length === 0" class="empty">Aún no has publicado opiniones.</p>

        <h2>Mis artículos en marketplace</h2>
        <div class="mini-items">
          <div v-for="item in myItems" :key="item.id" class="mini-item">
            <span class="dot" :style="{ background: colorForSubject(item.subject) }"></span>
            <span class="title">{{ item.title }}</span>
            <span class="price">{{ item.type === 'venta' ? `$${item.price}` : 'Renta' }}</span>
          </div>
        </div>
        <p v-if="myItems.length === 0" class="empty">Aún no has publicado artículos.</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { currentUser } from '../data/currentUser.js'
import { posts, marketplaceItems } from '../data/mockData.js'
import PostCard from '../components/PostCard.vue'
import { initialsFor, colorForSubject } from '../utils/subjectColor.js'

const form = reactive({ ...currentUser })
const editing = ref(false)
const initials = computed(() => initialsFor(form.name))

const myPosts = computed(() => posts.filter(p => p.author === currentUser.name && !p.anonymous))
const myItems = computed(() => marketplaceItems.filter(i => i.seller === currentUser.name))
const avgRating = computed(() => {
  if (myPosts.value.length === 0) return '—'
  const total = myPosts.value.reduce((sum, p) => sum + p.rating, 0)
  return (total / myPosts.value.length).toFixed(1)
})

function save() {
  Object.assign(currentUser, form)
  editing.value = false
}
function cancel() {
  Object.assign(form, currentUser)
  editing.value = false
}
</script>

<style scoped>
.page { max-width: 880px; }
.banner {
  height: 110px;
  border-radius: 14px;
  background: linear-gradient(120deg, var(--blue-300), var(--blue-500) 60%, var(--navy));
  margin-bottom: -40px;
}
.header { display: flex; align-items: flex-end; gap: 1.25rem; padding: 0 0.5rem; margin-bottom: 1.5rem; }
.avatar-lg {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: var(--white);
  color: var(--blue-500);
  border: 4px solid var(--white);
  box-shadow: 0 4px 14px rgba(13, 27, 62, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.5rem;
  flex: none;
}
.career { color: var(--slate); margin-top: 0.2rem; }

.stats {
  display: flex;
  gap: 2.5rem;
  padding: 1rem 0.5rem 1.5rem;
  border-bottom: 1px solid var(--line);
  margin-bottom: 1.75rem;
}
.stat { display: flex; flex-direction: column; }
.num { font-family: var(--font-display); font-weight: 700; font-size: 1.6rem; color: var(--blue-500); }
.label { font-size: 0.78rem; color: var(--slate); margin-top: 0.15rem; }

.columns { display: grid; grid-template-columns: 300px 1fr; gap: 2rem; align-items: start; }
.card { background: var(--white); border: 1px solid var(--line); border-radius: 12px; padding: 1.5rem; }
dl { margin: 0 0 1.25rem; }
.row { display: flex; justify-content: space-between; padding: 0.55rem 0; border-bottom: 1px solid var(--line); font-size: 0.92rem; }
dt { color: var(--slate); margin: 0; }
dd { margin: 0; font-weight: 500; }
.edit {
  padding: 0.6rem 1.1rem;
  border: none;
  border-radius: 8px;
  background: var(--blue-500);
  color: white;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
}
.edit:hover { background: var(--navy-soft); }
form { display: flex; flex-direction: column; gap: 1rem; }
label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.88rem; color: var(--slate); }
input { padding: 0.55rem 0.75rem; border: 1px solid var(--line); border-radius: 8px; font-family: var(--font-body); }
.actions { display: flex; gap: 0.75rem; }
.save { background: var(--blue-500); color: white; border: none; padding: 0.6rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
.cancel { background: transparent; border: 1px solid var(--line); padding: 0.6rem 1rem; border-radius: 8px; cursor: pointer; color: var(--slate); }

.activity h2 { margin-top: 0; }
.mini-items { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 0.5rem; }
.mini-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--white);
  font-size: 0.88rem;
}
.mini-item .dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }
.mini-item .title { flex: 1; font-weight: 500; }
.mini-item .price { color: var(--navy); font-weight: 600; }
.empty { color: var(--slate); font-size: 0.88rem; }

@media (max-width: 760px) {
  .columns { grid-template-columns: 1fr; }
}
</style>
