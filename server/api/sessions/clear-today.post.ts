interface SessionItem {
  id: string
  startedAt?: string
  [key: string]: unknown
}

export default defineEventHandler((event) => {
  const sessions = readJSON<SessionItem[]>('sessions.json', [])
  const todayStr = new Date().toISOString().slice(0, 10)

  // Keep only sessions NOT from today
  const remaining = sessions.filter(s => {
    if (!s.startedAt) return false
    return !s.startedAt.startsWith(todayStr)
  })

  writeJSON('sessions.json', remaining)
  return { success: true, deletedCount: sessions.length - remaining.length, remainingCount: remaining.length }
})
