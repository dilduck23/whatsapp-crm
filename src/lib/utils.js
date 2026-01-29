// Formatear tiempo relativo (hace X minutos, etc.)
export function formatDistanceToNow(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'ahora'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`

  // Si es más de una semana, mostrar fecha
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
  })
}

// Formatear hora del mensaje
export function formatTime(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Formatear número de teléfono para mostrar
export function formatPhone(phone) {
  if (!phone) return ''

  // Formato básico: +XX XXX XXX XXX
  const cleaned = phone.replace(/[^0-9+]/g, '')

  if (cleaned.startsWith('+')) {
    const countryCode = cleaned.slice(0, 3)
    const rest = cleaned.slice(3)
    const parts = rest.match(/.{1,3}/g) || []
    return `${countryCode} ${parts.join(' ')}`
  }

  return cleaned
}

// Truncar texto largo
export function truncate(text, maxLength = 50) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}
