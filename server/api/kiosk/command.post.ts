interface KioskCommand {
  action: string
  timestamp: number
  version: number
  nonce: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ action: string }>(event)
  const current = readJSON<KioskCommand>('kiosk_command.json', {
    action: 'none',
    timestamp: 0,
    version: 0,
    nonce: '',
  })

  const command: KioskCommand = {
    action: body?.action || 'reset_home',
    timestamp: Date.now(),
    version: (current.version || 0) + 1,
    nonce: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  }

  writeJSON('kiosk_command.json', command)
  return { success: true, command }
})
