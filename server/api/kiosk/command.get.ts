interface KioskCommand {
  action: string
  timestamp: number
  version: number
  nonce: string
}

export default defineEventHandler(() => {
  const command = readJSON<KioskCommand>('kiosk_command.json', {
    action: 'none',
    timestamp: 0,
    version: 0,
    nonce: '',
  })
  return command
})
