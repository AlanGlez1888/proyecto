import { reactive } from 'vue'
import { posts, marketplaceItems } from './mockData.js'
import { currentUser } from './currentUser.js'

// Calcula qué logros ya se tenían desde el inicio (con los datos de ejemplo),
// para no "celebrar" algo que ya estaba desbloqueado desde antes.
function computeBadgeLabels() {
  const myPosts = posts.filter(p => p.author === currentUser.name && !p.anonymous)
  const myItems = marketplaceItems.filter(i => i.seller === currentUser.name)
  const labels = []
  if (myPosts.length >= 1) labels.push('Primera opinión')
  if (myPosts.length >= 3) labels.push('Voz activa')
  if (myItems.length >= 1) labels.push('Emprendedor')
  return labels
}

export const seenBadges = reactive(new Set(computeBadgeLabels()))
