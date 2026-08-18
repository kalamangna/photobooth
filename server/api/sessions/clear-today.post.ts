interface SessionItem {
  id: string
  startedAt?: string
  [key: string]: unknown
}

export default defineEventHandler((event) => {
  const sessions = readJSON<SessionItem[]>('sessions.json', [])
  const todayStr = new Date().toISOString().slice(0, 10)

  // Keep sessions NOT from today; preserve sessions without startedAt (data integrity)
  const remaining = sessions.filter(s => {
    if (!s.startedAt) return true  // keep if startedAt is missing
    return !s.startedAt.startsWith(todayStr)
  })

  writeJSON('sessions.json', remaining)
  return { success: true, deletedCount: sessions.length - remaining.length, remainingCount: remaining.length }
})
