interface SessionPayload {
  id: string
  [key: string]: unknown
}

export default defineEventHandler(async (event) => {
  const session = await readBody<SessionPayload>(event)
  if (!session || !session.id) {
    throw createError({ statusCode: 400, message: 'Invalid session payload' })
  }

  const sessions = readJSON<SessionPayload[]>('sessions.json', [])
  const existingIdx = sessions.findIndex(s => s.id === session.id)

  if (existingIdx >= 0) {
    sessions[existingIdx] = { ...sessions[existingIdx], ...session }
  } else {
    sessions.unshift(session)
  }

  writeJSON('sessions.json', sessions)
  return { success: true, session }
})
