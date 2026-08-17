export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)
  const current = readJSON<Record<string, unknown>>('settings.json', {
    activeEventName: 'RD Photobooth',
    adminPin: '123456',
    lastTotalShots: 3,
    activeCountdown: 5,
  })

  const updated = {
    ...current,
    ...body,
    updatedAt: new Date().toISOString(),
  }

  writeJSON('settings.json', updated)
  return { success: true, settings: updated }
})
