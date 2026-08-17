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
        class="absolute inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-black/80 backdrop-blur-sm"
      >
        <div class="w-12 h-12 rounded-full border-4 border-zinc-700 border-t-amber-400 animate-spin" />
        <div class="flex flex-col items-center gap-1.5 text-center">
          <p class="text-lg font-bold text-zinc-100 tracking-tight">Creating your photos…</p>
          <p class="text-sm text-zinc-400">Preparing your memory</p>
        </div>
      </div>
    </Transition>

    <!-- ── Camera viewport ────────────────────────────────── -->
    <div class="relative flex-1 min-w-0 min-h-0 bg-black flex items-center justify-center overflow-hidden">

      <!-- Live video -->
      <video
        v-show="showLiveCamera"
        ref="videoRef"
        class="w-full h-full object-cover scale-x-[-1]"
        autoplay muted playsinline
      />

      <!-- Shot counter badge -->
      <div
        v-if="showLiveCamera && sessionStore.totalShots > 1"
        class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/55 backdrop-blur-md border border-white/8 rounded-full px-3 py-1 pointer-events-none"
      >
        <span class="font-mono text-xs font-bold text-zinc-300">
          {{ sessionStore.currentShot + 1 }} / {{ sessionStore.totalShots }}
        </span>
      </div>

      <!-- Countdown overlay -->
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-150 ease-in"
        leave-to-class="opacity-0"
      >
        <div
          v-if="sessionStore.sessionState === 'COUNTDOWN'"
          class="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 pointer-events-none"
        >
          <!-- Microcopy -->
          <p class="text-sm font-bold tracking-[0.2em] uppercase text-amber-300/80">{{ shotMicrocopy }}</p>

          <!-- Ring + number -->
          <div class="relative flex items-center justify-center">
            <svg class="-rotate-90 w-[clamp(120px,20vmin,180px)] h-[clamp(120px,20vmin,180px)]" viewBox="0 0 120 120">
              <circle class="stroke-white/10" cx="60" cy="60" r="52" fill="none" stroke-width="5" />
              <circle
                class="stroke-amber-400 transition-[stroke-dashoffset] duration-1000 ease-linear"
                cx="60" cy="60" r="52"
                fill="none" stroke-width="5" stroke-linecap="round"
                :stroke-dasharray="CIRCUMFERENCE"
                :stroke-dashoffset="ringOffset"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <Transition
                enter-active-class="transition-all duration-150 ease-out"
                enter-from-class="opacity-0 scale-150"
                leave-active-class="transition-all duration-80 ease-in"
                leave-to-class="opacity-0 scale-75"
                mode="out-in"
              >
                <span
                  v-if="countdownVal > 0"
                  :key="countdownVal"
                  class="font-mono font-black text-amber-400 leading-none select-none text-[clamp(2.5rem,8vmin,5rem)] [text-shadow:0_0_30px_rgba(245,158,11,0.8)]"
                >{{ countdownVal }}</span>
                <Icon
                  v-else
                  key="cam"
                  name="lucide:camera"
                  class="text-amber-400 w-[clamp(2rem,6vmin,3.5rem)] h-[clamp(2rem,6vmin,3.5rem)]"
                />
              </Transition>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Result preview -->
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-150 ease-in"
        leave-to-class="opacity-0"
      >
        <div v-if="showResult" class="absolute inset-0 bg-zinc-950 flex items-center justify-center p-3">
          <img
            v-if="sessionStore.current?.outputUrl"
            :src="sessionStore.current.outputUrl"
            class="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            alt="Hasil foto"
          />
        </div>
      </Transition>
    </div>

    <!-- ── Control panel ──────────────────────────────────── -->
    <div
      class="flex shrink-0 bg-zinc-900 overflow-y-auto"
      :class="isLandscape
        ? 'flex-col w-[clamp(260px,28vw,340px)] h-full border-l border-zinc-800 p-5 gap-4 items-stretch'
        : 'flex-row w-full border-t border-zinc-800 px-5 py-3 gap-4 items-center max-h-[30dvh] min-h-[110px]'"
    >

      <!-- Shot thumbnails -->
      <div
        v-if="sessionStore.totalShots > 1"
        class="flex gap-2 items-center shrink-0"
        :class="isLandscape ? 'flex-row flex-wrap justify-center' : 'flex-col'"
      >
        <div
          v-for="(photo, i) in sessionStore.photos"
          :key="i"
          class="w-12 h-14 rounded-[10px] border overflow-hidden flex items-center justify-center bg-black shrink-0 transition-colors duration-200"
          :class="{
            'border-emerald-500':  photo.dataUrl !== null,
            'border-amber-400':    photo.dataUrl === null && sessionStore.currentShot === i && !showResult,
            'border-zinc-800':     photo.dataUrl === null && (sessionStore.currentShot !== i || showResult),
          }"
        >
          <img v-if="photo.dataUrl" :src="photo.dataUrl" class="w-full h-full object-cover" alt="" />
          <span v-else class="text-xs font-mono font-bold text-zinc-600">{{ i + 1 }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col gap-2.5 flex-1 min-w-0">

        <!-- READY -->
        <template v-if="sessionStore.sessionState === 'READY'">
          <p class="text-xs font-semibold text-zinc-500 text-center">{{ shotHeadline }}</p>
          <button
            id="btn-capture"
            class="w-full min-h-[52px] px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.97] text-zinc-950 font-bold text-base flex items-center justify-center gap-2.5 shadow-[0_4px_24px_rgba(245,158,11,0.25)] transition-all"
            @click="startCountdown"
          >
            <Icon name="lucide:camera" class="w-5 h-5 shrink-0" />
            {{ sessionStore.currentShot === 0 ? 'Mulai Foto' : 'Foto Berikutnya' }}
          </button>
          <button
            v-if="sessionStore.currentShot > 0"
            class="flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
            @click="sessionStore.retakeShot()"
          >
            <Icon name="lucide:rotate-ccw" class="w-3.5 h-3.5" />
            Foto Ulang
          </button>
        </template>

        <!-- COUNTDOWN -->
        <template v-if="sessionStore.sessionState === 'COUNTDOWN'">
          <p class="text-sm text-zinc-500 text-center animate-pulse">Bersiap…</p>
        </template>

        <!-- PREVIEW -->
        <template v-if="sessionStore.sessionState === 'PREVIEW'">
          <p class="text-sm font-bold text-zinc-200 text-center">Foto siap! 🎉</p>

          <!-- Email (required) -->
          <div class="bg-zinc-950/80 border border-zinc-800 rounded-[14px] p-3.5 flex flex-col gap-2">
            <label class="text-[11px] font-semibold text-zinc-400" for="guest-email">
              Email untuk softfile foto
            </label>
            <div class="flex gap-2">
              <input
                id="guest-email"
                v-model="custEmail"
                type="email"
                inputmode="email"
                class="flex-1 min-w-0 px-3.5 py-2.5 rounded-[10px] bg-black border text-zinc-100 text-sm font-sans outline-none transition-colors"
                :class="emailError ? 'border-rose-500/60' : 'border-zinc-800 focus:border-amber-500/60'"
                placeholder="nama@email.com"
                maxlength="60"
                required
                @input="emailError = false"
              />
              <button
                class="shrink-0 px-4 py-2.5 rounded-[10px] bg-amber-500 hover:bg-amber-400 active:scale-[0.97] text-zinc-950 text-sm font-bold transition-all flex items-center justify-center min-w-[72px] disabled:opacity-50"
                :disabled="isSendingEmail"
                @click="handleFinish"
              >
                <Icon v-if="isSendingEmail" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                <span v-else>Selesai</span>
              </button>
            </div>
            <span v-if="emailError" class="text-[11px] text-rose-400">{{ emailErrorMsg }}</span>
            <span v-if="emailSent" class="text-[11px] text-emerald-400">✓ Terkirim</span>
          </div>

          <button
            class="flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
            @click="handleRetake"
          >
            <Icon name="lucide:rotate-ccw" class="w-3.5 h-3.5" />
            Foto Ulang
          </button>
        </template>

        <!-- DONE -->
        <template v-if="sessionStore.sessionState === 'DONE'">
          <div class="flex flex-col items-center gap-3 w-full">
            <div class="flex flex-col items-center gap-0.5 text-center">
              <span class="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-amber-400">Your photos</span>
              <p class="text-xs text-zinc-500">Scan QR untuk softfile foto</p>
            </div>
            <div class="w-[clamp(140px,40%,200px)] aspect-square bg-white rounded-[14px] p-2 flex items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <img v-if="qrDataUrl" :src="qrDataUrl" class="w-full h-full object-contain" alt="QR Foto" />
              <Icon v-else name="lucide:loader-2" class="w-6 h-6 text-zinc-400 animate-spin" />
            </div>
            <p class="text-[11px] text-zinc-600 text-center">Ambil hasil print di meja operator</p>
          </div>
        </template>

      </div>

      <!-- Cancel button -->
      <button
        v-if="sessionStore.sessionState === 'READY' || sessionStore.sessionState === 'PREVIEW'"
        class="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-600 hover:text-zinc-400 transition-colors self-end mt-auto shrink-0"
        @click="handleCancel"
      >
        <Icon name="lucide:x" class="w-3.5 h-3.5" />
        Batal
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'
import { useSessionStore }  from '~/stores/session'
import { useTemplateStore } from '~/stores/template'
import { renderTemplate }   from '~/services/renderer'
import { settingsDB }       from '~/services/db'
import type { PhotoTemplate } from '~/types/template'

definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Photobooth — Sesi Foto' })

const router       = useRouter()
const sessionStore = useSessionStore()
const templateStore = useTemplateStore()

const eventName  = ref('')
const cdDuration = ref(5)
const isLandscape = ref(false)

function updateOrientation() {
  isLandscape.value = window.matchMedia('(orientation: landscape)').matches
}

let remoteCommandTimer: ReturnType<typeof setInterval> | null = null
let initialCmdVersion = 0
let initialCmdNonce   = ''

onMounted(async () => {
  if (!sessionStore.current) { await router.replace('/'); return }

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
  showPicker.value = true
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
      sessionStore.current.photos = Array.from({ length: tpl.totalSlots }, (_, i) => ({ index: i, dataUrl: null, capturedAt: null }))
    }
  }
  await initCamera()
}

async function onBackFromPicker() {
  showPicker.value = false
  await router.replace('/setup')
}

// ── Camera ─────────────────────────────────────────────────────
const videoRef = ref<HTMLVideoElement | null>(null)
let stream: MediaStream | null = null

async function initCamera() {
  await nextTick()
  if (stream && stream.active && videoRef.value) {
    videoRef.value.srcObject = stream
    videoRef.value.play().catch(() => {})
    return
  }
  try {
    let mediaStream: MediaStream | null = null
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920, min: 640 }, height: { ideal: 1080, min: 480 }, facingMode: 'user' },
        audio: false,
      })
    } catch {
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    }
    stream = mediaStream
    if (videoRef.value && stream) {
      videoRef.value.srcObject = stream
      videoRef.value.onloadedmetadata = () => { videoRef.value?.play().catch(() => {}) }
      await videoRef.value.play().catch(() => {})
    }
  } catch (err) {
    console.warn('[Camera] Mock:', err)
    initMockStream()
  }
}

function initMockStream() {
  const canvas = document.createElement('canvas')
  canvas.width = 1280; canvas.height = 960
  const ctx = canvas.getContext('2d')!
  function draw() {
    ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 36px Inter, sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('📷 RD Photobooth', canvas.width / 2, canvas.height / 2 - 16)
    ctx.fillStyle = '#52525b'; ctx.font = '20px Inter, sans-serif'
    ctx.fillText('Simulasi Kamera', canvas.width / 2, canvas.height / 2 + 24)
    requestAnimationFrame(draw)
  }
  draw()
  const mockStream = (canvas as any).captureStream?.(30)
  if (mockStream && videoRef.value) { videoRef.value.srcObject = mockStream; videoRef.value.play().catch(() => {}) }
}

function stopCamera() {
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
}

// ── Countdown ──────────────────────────────────────────────────
const countdownVal = ref(0)
let timer: ReturnType<typeof setInterval> | null = null
const CIRCUMFERENCE = 2 * Math.PI * 52
const ringOffset = computed(() => CIRCUMFERENCE * (1 - countdownVal.value / cdDuration.value))

function clearTimer() { if (timer) { clearInterval(timer); timer = null } }

async function startCountdown() {
  countdownVal.value = cdDuration.value
  await sessionStore.startCountdown()
  timer = setInterval(async () => {
    countdownVal.value--
    if (countdownVal.value <= 0) { clearTimer(); await capturePhoto() }
  }, 1000)
}

// ── Microcopy ──────────────────────────────────────────────────
const shotMicrocopy = computed(() => {
  const i = sessionStore.currentShot; const t = sessionStore.totalShots
  if (t === 1) return 'GET READY'
  if (i === 0) return 'PHOTO 1'
  if (i === t - 1) return 'LAST ONE!'
  return 'ONE MORE!'
})

const shotHeadline = computed(() => {
  const i = sessionStore.currentShot; const t = sessionStore.totalShots
  if (t === 1) return 'Bersiap di depan kamera'
  if (i === 0) return 'Foto pertama!'
  if (i === t - 1) return 'Ini yang terakhir!'
  return `Foto ke-${i + 1} dari ${t}`
})

// ── Capture ────────────────────────────────────────────────────
const showFlash = ref(false)

async function capturePhoto() {
  showFlash.value = true
  setTimeout(() => { showFlash.value = false }, 350)
  const dataUrl = grabFrame()
  await sessionStore.capturePhoto(dataUrl)
  if (sessionStore.sessionState === 'PROCESSING') await processPhotos()
}

function grabFrame(): string {
  const video = videoRef.value
  if (!video) return ''
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth || 1280; canvas.height = video.videoHeight || 960
  const ctx = canvas.getContext('2d')!
  ctx.translate(canvas.width, 0); ctx.scale(-1, 1)
  ctx.drawImage(video, 0, 0)
  return canvas.toDataURL('image/jpeg', 0.93)
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
}

// ── Email & Finish ─────────────────────────────────────────────
const custEmail      = ref('')
const emailError     = ref(false)
const emailErrorMsg  = ref('Email wajib diisi.')
const emailSent      = ref(false)
const isSendingEmail = ref(false)
const qrDataUrl      = ref('')

function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

async function generateQRCode(url: string) {
  try {
    qrDataUrl.value = await QRCode.toDataURL(url, { width: 240, margin: 1.5, color: { dark: '#09090b', light: '#ffffff' } })
  } catch (err) { console.error('QR generation failed:', err) }
}

async function handleFinish() {
  const email = custEmail.value.trim()
  if (!email) {
    emailErrorMsg.value = 'Email wajib diisi.'
    emailError.value = true
    return
  }
  if (!isEmailValid(email)) {
    emailErrorMsg.value = 'Format email tidak valid.'
    emailError.value = true
    return
  }
  isSendingEmail.value = true
  try {
    await sessionStore.setCustomerInfo('', email)
    emailSent.value = true
    await sessionStore.finishSession()
    if (sessionStore.current?.id && typeof window !== 'undefined') {
      const downloadUrl = `${window.location.origin}/download/${sessionStore.current.id}`
      await generateQRCode(downloadUrl)
    }
  } finally { isSendingEmail.value = false }
}

// ── Retake / Cancel ────────────────────────────────────────────
async function handleRetake() {
  custEmail.value = ''; emailError.value = false; emailSent.value = false
  await sessionStore.startSession({ totalShots: sessionStore.totalShots })
  showPicker.value = true
}

async function handleCancel() { await sessionStore.resetSession(); await router.replace('/') }
async function resetToHome()  { await sessionStore.resetSession(); await router.replace('/') }

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

