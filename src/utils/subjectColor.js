// Asigna un color consistente a cada materia, para que se pueda
// identificar visualmente sin depender solo del texto.
const PALETTE = ['#1565C0', '#B7791F', '#2E7D32', '#8E24AA', '#C0392B', '#00838F']

export function colorForSubject(subject) {
  if (!subject) return PALETTE[0]
  let hash = 0
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

export function initialsFor(name) {
  if (!name) return '?'
  const parts = name.replace(/^(Ing\.|Lic\.|Dr\.|Dra\.|Mtro\.|Mtra\.)\s*/i, '').split(' ')
  return parts
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('')
}
