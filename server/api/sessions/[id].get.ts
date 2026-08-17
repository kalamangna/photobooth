interface SessionItem {
  id: string
  [key: string]: unknown
}

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Session ID is required' })
  }

  const sessions = readJSON<SessionItem[]>('sessions.json', [])
  const session = sessions.find(s => s.id === id)

  if (!session) {
    throw createError({ statusCode: 404, statusMessage: 'Session not found' })
  }

  return session
})
