import { useSessionStore } from '~/stores/session'

export default defineNuxtPlugin(async () => {
  if (typeof window === 'undefined') return
  const sessionStore = useSessionStore()
  await sessionStore.loadAdminSettings().catch(() => {})
})
