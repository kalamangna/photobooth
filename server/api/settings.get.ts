export default defineEventHandler(() => {
  const settings = readJSON<Record<string, unknown>>('settings.json', {
    activeEventName: 'RD Photobooth',
    lastTotalShots: 3,
    activeCountdown: 5,
  })

  // Jangan kembalikan PIN ke client — tersimpan di server hanya untuk backup.
  // Verifikasi PIN dilakukan client-side via IndexedDB + Web Crypto.
  const { adminPin: _a, operatorPin: _o, ...safeSettings } = settings
  return safeSettings
})
