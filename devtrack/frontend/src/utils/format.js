const MS_PER_DAY = 86_400_000

/** Parse a YYYY-MM-DD string as a local date (avoids the UTC off-by-one). */
export function parseDate(value) {
  if (!value) return null
  const [y, m, d] = value.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDate(value, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  const date = parseDate(value)
  return date ? date.toLocaleDateString(undefined, options) : '—'
}

export function daysUntil(value, now = new Date()) {
  const date = parseDate(value)
  if (!date) return null
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((date - today) / MS_PER_DAY)
}

export function dueLabel(value, now = new Date()) {
  const days = daysUntil(value, now)
  if (days === null) return 'No date'
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return `In ${days} days`
}

export function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?'
}

export function parseList(text) {
  return [...new Set(text.split(',').map((s) => s.trim()).filter(Boolean))]
}

export function toInputDate(value) {
  return value ? value.slice(0, 10) : ''
}

/** Turn '' into null so optional fields validate on the API. */
export function emptyToNull(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v === '' ? null : v]))
}
