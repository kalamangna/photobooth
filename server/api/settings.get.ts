export default defineEventHandler(() => {
  const settings = readJSON<Record<string, unknown>>('settings.json', {
    activeEventName: 'RD Photobooth',
    adminPin: '888888',
    operatorPin: '123456',
    lastTotalShots: 3,
    activeCountdown: 5,
  })
  return settings
})
