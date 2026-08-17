interface SessionItem {
  id: string
  [key: string]: unknown
}

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing session ID' })
  }

  let sessions = readJSON<SessionItem[]>('sessions.json', [])
  sessions = sessions.filter(s => s.id !== id)
  writeJSON('sessions.json', sessions)

  return { success: true, deletedId: id }
})
