<template>
  <div
    class="relative w-[100dvw] h-[100dvh] overflow-hidden bg-black select-none"
    :class="isLandscape ? 'flex flex-row' : 'flex flex-col'"
  >

    <!-- ── Template picker overlay ─────────────────────────── -->
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div v-if="showPicker" class="absolute inset-0 z-50 bg-zinc-950 flex items-center justify-center">
        <TemplatePicker @selected="onTemplatePicked" @back="onBackFromPicker" />
      </div>
    </Transition>

    <!-- ── Capture flash ──────────────────────────────────── -->
    <Transition
      enter-active-class="transition-opacity duration-[80ms] ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-[200ms] ease-in"
      leave-to-class="opacity-0"
    >
      <div v-if="showFlash" class="absolute inset-0 bg-white pointer-events-none z-[100]" />
    </Transition>

    <!-- ── Processing overlay ─────────────────────────────── -->
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sessionStore.sessionState === 'PROCESSING'"
        class="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-black/85 backdrop-blur-sm"
      >
        <div class="w-12 h-12 rounded-full border-4 border-zinc-700 border-t-amber-400 animate-spin" />
        <div class="flex flex-col items-center gap-1 text-center">
          <p class="text-xl font-bold text-zinc-100 tracking-tight">Menyiapkan foto...</p>
          <p class="text-xs text-zinc-400">Tunggu sebentar ya</p>
        </div>
      </div>
    </Transition>

    <!-- ── Camera viewport ────────────────────────────────── -->
    <SessionCameraViewport
      :slot-ratio="slotRatio"
      :slot-border-radius="slotBorderRadius"
      :show-live-camera="showLiveCamera"
      :show-result="showResult"
      :output-url="sessionStore.current?.outputUrl ?? null"
      :current-shot="sessionStore.currentShot"
      :total-shots="sessionStore.totalShots"
    >
      <!-- Live video -->
      <video
        ref="videoRef"
        class="w-full h-full object-cover scale-x-[-1]"
        autoplay muted playsinline
      />

      <!-- Countdown overlay -->
      <SessionCountdownOverlay
        :active="sessionStore.sessionState === 'COUNTDOWN'"
        :countdown-val="countdownVal"
        :cd-duration="cdDuration"
        :shot-microcopy="shotMicrocopy"
      />
    </SessionCameraViewport>

    <!-- ── Control panel ──────────────────────────────────── -->
    <SessionControlPanel
      :session-state="sessionStore.sessionState"
      :current-shot="sessionStore.currentShot"
      :total-shots="sessionStore.totalShots"
      :photos="sessionStore.photos"
      :is-landscape="isLandscape"
      :shot-headline="shotHeadline"
      @capture="startCountdown"
      @retake-shot="(i) => sessionStore.retakeShot(i)"
      @finish="handleFinish"
      @retake-all="handleRetake"
    >
      <template #done>
        <SessionDonePanel
          :event-name="eventName"
          :has-custom-event="hasCustomEvent"
          :session-id="sessionStore.current?.id ?? null"
        />
      </template>
    </SessionControlPanel>

  </div>
</template>

<script setup lang="ts">
import { useSessionStore }  from '~/stores/session'
import { useTemplateStore } from '~/stores/template'
import { renderTemplate }   from '~/services/renderer'
import { settingsDB }       from '~/services/db'
import {
  playCountdownBeep,
  playShutterSound,
  playSuccessChime,
  syncAudioSetting,
  getAudioContext,
} from '~/services/sound'
import type { PhotoElement, PhotoTemplate } from '~/types/template'

definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Sesi Foto — RD Photobooth' })

const router        = useRouter()
const sessionStore  = useSessionStore()
const templateStore = useTemplateStore()

// ── Camera composable ──────────────────────────────────────────
const { videoRef, initCamera, stopCamera, grabFrame } = useSessionCamera()

// ── State ──────────────────────────────────────────────────────
const eventName   = ref('')
const cdDuration  = ref(5)
const isLandscape = ref(false)

const hasCustomEvent = computed(() =>
  Boolean(eventName.value && eventName.value.trim().toLowerCase() !== 'rd photobooth')
)

// ── Active photo slot → viewfinder dimensions ──────────────────
const activePhotoSlot = computed<PhotoElement | null>(() => {
  const tpl = templateStore.active
  if (!tpl) return null
  const shotIdx = sessionStore.currentShot ?? 0
  const slotEl = tpl.elements.find((el): el is PhotoElement => el.type === 'photo' && el.slot === shotIdx)
  if (slotEl) return slotEl
  return tpl.elements.find((el): el is PhotoElement => el.type === 'photo') || null
})

const slotRatio = computed(() => {
  if (!activePhotoSlot.value?.width || !activePhotoSlot.value?.height) return 4 / 3
  return activePhotoSlot.value.width / activePhotoSlot.value.height
})

const slotBorderRadius = computed(() => {
  if (!activePhotoSlot.value?.borderRadius) return 16
  return Math.min(24, Math.max(8, activePhotoSlot.value.borderRadius * 2))
})

// ── Orientation ────────────────────────────────────────────────
function updateOrientation() {
  isLandscape.value = window.matchMedia('(orientation: landscape)').matches
}

// ── Remote command polling ─────────────────────────────────────
let remoteCommandTimer: ReturnType<typeof setInterval> | null = null
let initialCmdVersion = 0
let initialCmdNonce   = ''

onMounted(async () => {
  if (!sessionStore.current) {
    const recovered = await sessionStore.recoverActiveSession()
    if (!recovered || !sessionStore.current) {
      await router.replace('/')
      return
    }
  }

  updateOrientation()
  window.addEventListener('resize', updateOrientation)
  window.addEventListener('orientationchange', updateOrientation)

  try {
    const initCmd = await $fetch<{ version?: number; nonce?: string }>('/api/kiosk/command').catch(() => null)
    initialCmdVersion = initCmd?.version ?? 0
    initialCmdNonce   = initCmd?.nonce ?? ''
  } catch { /* offline */ }

  const dbEvent    = await settingsDB.get<string>('activeEventName')
  const localEvent = typeof localStorage !== 'undefined' ? localStorage.getItem('photobooth_event_name') : null
  eventName.value  = sessionStore.current.eventName || dbEvent || localEvent || 'RD Photobooth'
  if (!sessionStore.current.eventName && eventName.value) sessionStore.current.eventName = eventName.value

  cdDuration.value = sessionStore.configuredCountdown || (await settingsDB.get<number>('activeCountdown')) || 5

  await templateStore.loadTemplates()

  if (sessionStore.current.templateId) {
    templateStore.setActive(sessionStore.current.templateId)
    showPicker.value = false
  } else {
    showPicker.value = true
  }

  await syncAudioSetting()
  const unlockAudio = () => {
    getAudioContext()
    window.removeEventListener('click', unlockAudio)
    window.removeEventListener('touchstart', unlockAudio)
  }
  window.addEventListener('click', unlockAudio, { passive: true })
  window.addEventListener('touchstart', unlockAudio, { passive: true })

  initCamera()
  window.addEventListener('keydown', onKeyDown)

  remoteCommandTimer = setInterval(async () => {
    try {
      const cmd = await $fetch<{ action: string; version?: number; nonce?: string }>('/api/kiosk/command').catch(() => null)
      if (!cmd || cmd.action !== 'reset_home') return
      const isNewVersion = cmd.version !== undefined && cmd.version > initialCmdVersion
      const isNewNonce   = Boolean(cmd.nonce && cmd.nonce !== initialCmdNonce)
      if (isNewVersion || isNewNonce) resetToHome()
    } catch { /* offline */ }
  }, 1000)
})

onUnmounted(() => {
  if (remoteCommandTimer) { clearInterval(remoteCommandTimer); remoteCommandTimer = null }
  window.removeEventListener('resize', updateOrientation)
  window.removeEventListener('orientationchange', updateOrientation)
  window.removeEventListener('keydown', onKeyDown)
  clearTimer()
  stopCamera()
})

// ── Template picker ────────────────────────────────────────────
const showPicker = ref(false)

async function onTemplatePicked(tpl: PhotoTemplate) {
  showPicker.value = false
  templateStore.setActive(tpl)
  if (sessionStore.current) {
    sessionStore.current.templateId = tpl.id
    if (sessionStore.current.totalShots !== tpl.totalSlots) {
      sessionStore.current.totalShots = tpl.totalSlots
      sessionStore.current.photos = Array.from({ length: tpl.totalSlots }, (_, i) => ({
        index: i,
        dataUrl: null,
        capturedAt: null,
      }))
    }
  }
  await initCamera()
}

async function onBackFromPicker() {
  showPicker.value = false
  await router.replace('/setup')
}

// ── Countdown ──────────────────────────────────────────────────
const countdownVal = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function clearTimer() { if (timer) { clearInterval(timer); timer = null } }

async function startCountdown() {
  countdownVal.value = cdDuration.value
  await sessionStore.startCountdown()
  playCountdownBeep(countdownVal.value === 1)

  timer = setInterval(async () => {
    countdownVal.value--
    if (countdownVal.value > 0) {
      playCountdownBeep(countdownVal.value === 1)
    }
    if (countdownVal.value <= 0) {
      clearTimer()
      await capturePhoto()
    }
  }, 1000)
}

// ── Microcopy ──────────────────────────────────────────────────
const shotMicrocopy = computed(() => {
  const i = sessionStore.currentShot
  const t = sessionStore.totalShots
  if (countdownVal.value === 1) return 'SENYUM!'
  if (t === 1) return 'SIAP!'
  if (i === 0) return 'FOTO 1'
  if (i === t - 1) return 'TERAKHIR!'
  return `FOTO ${i + 1}`
})

const shotHeadline = computed(() => {
  const i = sessionStore.currentShot
  const t = sessionStore.totalShots
  if (t === 1) return 'Bersiap di depan kamera'
  if (i === 0) return `Foto 1 dari ${t}`
  if (i === t - 1) return `Foto terakhir! (${t} dari ${t})`
  return `Foto ${i + 1} dari ${t}`
})

// ── Capture ────────────────────────────────────────────────────
const showFlash = ref(false)

async function capturePhoto() {
  playShutterSound()
  showFlash.value = true
  setTimeout(() => { showFlash.value = false }, 350)
  const dataUrl = grabFrame()
  await sessionStore.capturePhoto(dataUrl)
  if (sessionStore.sessionState === 'PROCESSING') await processPhotos()
}

// ── Processing ─────────────────────────────────────────────────
async function processPhotos() {
  const photosMap: Record<number, string> = {}
  sessionStore.photos.forEach((p, i) => { if (p.dataUrl) photosMap[i] = p.dataUrl })
  const currentEvent = eventName.value || (await settingsDB.get<string>('activeEventName')) || ''
  const tpl = templateStore.active
  if (tpl) {
    const result = await renderTemplate(tpl, { photos: photosMap, scale: 1, eventName: currentEvent })
    await sessionStore.setOutput(result.dataUrl)
  } else {
    await sessionStore.setOutput(photosMap[0] ?? '')
  }
  playSuccessChime()
}

// ── Finish ─────────────────────────────────────────────────────
async function handleFinish() {
  await sessionStore.finishSession()
}

// ── Retake / Cancel ────────────────────────────────────────────
async function handleRetake() {
  await sessionStore.startSession({ totalShots: sessionStore.totalShots })
  showPicker.value = true
}

async function handleCancel() {
  await sessionStore.resetSession()
  await router.replace('/')
}

async function resetToHome() {
  await sessionStore.resetSession()
  await router.replace('/')
}

function onKeyDown(e: KeyboardEvent) {
  if (sessionStore.sessionState === 'DONE' && e.key === 'Escape') resetToHome()
}

// ── UI helpers ─────────────────────────────────────────────────
const showLiveCamera = computed(() => !showResult.value)
const showResult = computed(() =>
  sessionStore.sessionState === 'PREVIEW' ||
  sessionStore.sessionState === 'PRINT'   ||
  sessionStore.sessionState === 'DONE'
)
</script>
