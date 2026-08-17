<template>
  <div
    class="relative w-[100dvw] h-[100dvh] overflow-hidden bg-[#0a0a0a] flex items-center justify-center cursor-pointer select-none"
    :class="isLandscape ? 'flex-row' : 'flex-col'"
    @click="goStart"
  >
    <!-- Ambient glow -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_70%,rgba(245,158,11,0.07)_0%,transparent_70%)] pointer-events-none" />

    <!-- Portrait layout -->
    <template v-if="!isLandscape">
      <div class="relative z-10 flex flex-col items-center text-center gap-[clamp(20px,4vh,40px)] max-w-[480px] px-[clamp(24px,6vw,48px)]">
        <p
          class="font-mono text-[11px] font-bold tracking-[0.22em] uppercase"
          :class="hasCustomEvent ? 'text-amber-400' : 'text-zinc-600'"
        >
          {{ hasCustomEvent ? activeEventName : 'RD Photobooth' }}
        </p>
        <h1 class="text-[clamp(2.75rem,10vmin,5.5rem)] font-black leading-[1.0] text-zinc-100 tracking-[-0.02em]">
          Abadikan<br><span class="text-amber-400">Momenmu</span>
        </h1>
        <p class="text-[clamp(0.875rem,2vmin,1.0625rem)] text-zinc-500 leading-relaxed">
          Berdiri di depan kamera dan tersenyum.
        </p>
        <NuxtLink
          id="btn-start"
          to="/setup"
          class="inline-flex items-center gap-2.5 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-[0.97] text-zinc-950 font-semibold shadow-[0_8px_40px_rgba(245,158,11,0.2)] hover:shadow-[0_12px_48px_rgba(245,158,11,0.32)] transition-all no-underline"
          style="padding: clamp(14px,2.5vmin,20px) clamp(28px,6vmin,56px); font-size: clamp(1rem,2.5vmin,1.25rem);"
          @click.stop
        >
          <Icon name="lucide:camera" class="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
          <span>Mulai Foto</span>
        </NuxtLink>
      </div>
    </template>

    <!-- Landscape layout -->
    <template v-else>
      <div class="relative z-10 flex flex-row items-center justify-center gap-[clamp(40px,8vw,100px)] w-full max-w-[900px] px-[clamp(32px,6vw,80px)]">
        <!-- Left: branding & CTA -->
        <div class="flex flex-col items-start gap-[clamp(16px,3vh,28px)]">
          <p
            class="font-mono text-[11px] font-bold tracking-[0.22em] uppercase cursor-pointer py-1 px-3 rounded-full active:opacity-70 transition-opacity"
            :class="hasCustomEvent ? 'text-amber-400' : 'text-zinc-600'"
            title="Klik 4x untuk Akses Operator"
            @click.stop="onSecretTrigger"
          >
            {{ hasCustomEvent ? activeEventName : 'RD Photobooth' }}
          </p>
          <h1 class="text-[clamp(2.25rem,7vw,4rem)] font-black leading-[1.05] text-zinc-100 tracking-[-0.02em]">
            Abadikan<br><span class="text-amber-400">Momenmu</span>
          </h1>
          <p class="text-[clamp(0.875rem,2vmin,1.0625rem)] text-zinc-500 leading-relaxed">
            Berdiri di depan kamera dan tersenyum.
          </p>
          <NuxtLink
            id="btn-start-landscape"
            to="/setup"
            class="inline-flex items-center gap-2.5 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-[0.97] text-zinc-950 font-semibold shadow-[0_8px_40px_rgba(245,158,11,0.2)] transition-all no-underline"
            style="padding: clamp(14px,2.5vmin,20px) clamp(28px,6vmin,56px); font-size: clamp(1rem,2.5vmin,1.25rem);"
            @click.stop
          >
            <Icon name="lucide:camera" class="w-5 h-5 shrink-0" />
            <span>Mulai Foto</span>
          </NuxtLink>
        </div>

        <!-- Right: camera icon deco -->
        <div
          class="shrink-0 flex items-center justify-center rounded-full border border-amber-500/10 bg-amber-500/4"
          style="width: clamp(120px,20vw,200px); height: clamp(120px,20vw,200px);"
        >
          <Icon name="lucide:camera" class="text-amber-400/30" style="width: clamp(48px,8vw,80px); height: clamp(48px,8vw,80px);" />
        </div>
      </div>
    </template>

    <!-- Tap hint -->
    <p class="absolute bottom-[clamp(16px,3vh,28px)] left-1/2 -translate-x-1/2 text-[11px] text-zinc-700 tracking-[0.08em] whitespace-nowrap pointer-events-none">
      Ketuk di mana saja untuk memulai
    </p>
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session'

definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'RD Photobooth',
  description: 'Photobooth layar sentuh mandiri offline-first.',
})

const router       = useRouter()
const sessionStore = useSessionStore()

const isStarting      = ref(false)
const activeEventName = ref('')
const isLandscape     = ref(false)

const hasCustomEvent = computed(() =>
  Boolean(activeEventName.value && activeEventName.value.trim().toLowerCase() !== 'rd photobooth')
)

function updateOrientation() {
  isLandscape.value = window.matchMedia('(orientation: landscape)').matches
}

function preventBrowserBack() {
  window.history.replaceState({ ...window.history.state }, '', window.location.href)
}

function onContextMenu(e: MouseEvent) { e.preventDefault() }

async function syncAdminRules() {
  try {
    const settings = await sessionStore.loadAdminSettings()
    if (settings && typeof settings.activeEventName === 'string') {
      activeEventName.value = settings.activeEventName
      if (typeof localStorage !== 'undefined') localStorage.setItem('photobooth_event_name', settings.activeEventName)
      return
    }
  } catch { /* offline */ }
  const localEvent = typeof localStorage !== 'undefined' ? localStorage.getItem('photobooth_event_name') : null
  activeEventName.value = localEvent || 'RD Photobooth'
}

let syncPollTimer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  await sessionStore.loadHistory(true)
  await syncAdminRules()

  updateOrientation()
  window.addEventListener('resize', updateOrientation)
  window.addEventListener('orientationchange', updateOrientation)

  syncPollTimer = setInterval(syncAdminRules, 2500)

  window.history.replaceState({ ...window.history.state }, '', window.location.href)
  window.addEventListener('popstate', preventBrowserBack)
  document.addEventListener('contextmenu', onContextMenu)
})

onUnmounted(() => {
  if (syncPollTimer) clearInterval(syncPollTimer)
  window.removeEventListener('resize', updateOrientation)
  window.removeEventListener('orientationchange', updateOrientation)
  window.removeEventListener('popstate', preventBrowserBack)
  document.removeEventListener('contextmenu', onContextMenu)
})

async function goStart() {
  if (isStarting.value) return
  isStarting.value = true
  try { await router.push('/setup') } finally { isStarting.value = false }
}

const secretClickCount = ref(0)
let secretClickTimer: ReturnType<typeof setTimeout> | null = null

function onSecretTrigger() {
  secretClickCount.value++
  if (secretClickTimer) clearTimeout(secretClickTimer)
  if (secretClickCount.value >= 4) {
    secretClickCount.value = 0
    router.push('/admin')
    return
  }
  secretClickTimer = setTimeout(() => {
    secretClickCount.value = 0
  }, 1200)
}
</script>
