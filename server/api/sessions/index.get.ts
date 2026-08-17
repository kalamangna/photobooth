export default defineEventHandler(() => {
  const sessions = readJSON<unknown[]>('sessions.json', [])
  return sessions
})
