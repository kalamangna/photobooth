export default defineEventHandler(() => {
  const settings = readJSON<Record<string, unknown>>('settings.json', {
    activeEventName: 'RD Photobooth',
    adminPin: '123456',
    lastTotalShots: 3,
    activeCountdown: 5,
  })
  return settings
})
