export default defineEventHandler(() => {
  writeJSON('sessions.json', [])
  return { success: true, deleted: 'all' }
})
