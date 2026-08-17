<template>
  <div
    class="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-zinc-950 text-zinc-100 select-none touch-manipulation cursor-pointer"
    @click="goStart"
  >
    <!-- Subtle ambient warmth — kedalaman tanpa dominasi -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_70%,rgba(245,158,11,0.07)_0%,transparent_70%)] pointer-events-none" />

    <div class="relative z-10 flex flex-col items-center text-center gap-12 sm:gap-16 max-w-lg px-10">

      <!-- Brand / Event -->
      <p
        class="font-mono text-[11px] tracking-[0.22em] uppercase"
        :class="hasCustomEvent ? 'text-amber-400' : 'text-zinc-600'"
      >
        {{ hasCustomEvent ? activeEventName : 'RD Photobooth' }}
      </p>

      <!-- Headline -->
      <h1 class="text-5xl sm:text-7xl lg:text-[5.5rem] font-black tracking-[-0.02em] leading-[1.0] text-zinc-100">
        Abadikan<br><span class="text-amber-400">Momenmu</span>
      </h1>

      <!-- CTA -->
      <NuxtLink
        id="btn-start"
        to="/setup"
        class="inline-flex items-center gap-3 px-12 sm:px-16 py-4 sm:py-5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-lg sm:text-xl transition-all duration-150 active:scale-[0.97] shadow-[0_8px_40px_rgba(245,158,11,0.18)]"
        @click.stop
      >
        <Icon name="lucide:camera" class="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
        <span>Mulai Foto</span>
      </NuxtLink>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import { settingsDB }      from '~/services/db'

definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'RD Photobooth — Layar Utama',
  description: 'Photobooth layar sentuh mandiri offline-first.',
})

const router       = useRouter()
const sessionStore = useSessionStore()

const isStarting       = ref(false)
const activeEventName  = ref('')

const hasCustomEvent = computed(() =>
  Boolean(activeEventName.value && activeEventName.value.trim().toLowerCase() !== 'rd photobooth')
)

function preventBrowserBack() {
  window.history.pushState(null, '', window.location.href)
}

function onContextMenu(e: MouseEvent) {
  e.preventDefault()
}

async function syncAdminRules() {
  try {
    const settings = await sessionStore.loadAdminSettings()
    if (settings && typeof settings.activeEventName === 'string') {
      activeEventName.value = settings.activeEventName
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('photobooth_event_name', settings.activeEventName)
      }
      return
    }
  } catch {
    // Offline
  }

  const localEvent = typeof localStorage !== 'undefined' ? localStorage.getItem('photobooth_event_name') : null
  activeEventName.value = localEvent || 'RD Photobooth'
}

let syncPollTimer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  await sessionStore.loadHistory(true)
  await syncAdminRules()

  // Auto-sync rules & event name from admin server every 2.5s
  syncPollTimer = setInterval(syncAdminRules, 2500)

  // Kiosk mode: trap browser back button & swipe back gestures
  window.history.pushState(null, '', window.location.href)
  window.addEventListener('popstate', preventBrowserBack)

  // Prevent context menu
  document.addEventListener('contextmenu', onContextMenu)
})

onUnmounted(() => {
  if (syncPollTimer) clearInterval(syncPollTimer)
  window.removeEventListener('popstate', preventBrowserBack)
  document.removeEventListener('contextmenu', onContextMenu)
})

async function goStart() {
  if (isStarting.value) return
  isStarting.value = true
  try {
    await router.push('/setup')
  } finally {
    isStarting.value = false
  }
}
</script>
