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
    <div class="relative flex-1 min-w-0 min-h-0 bg-black flex items-center justify-center p-3 sm:p-6 overflow-hidden">

      <!-- Viewfinder matching active template photo slot -->
      <div
        v-show="showLiveCamera"
        class="relative max-w-full max-h-full flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-zinc-800 bg-zinc-950 transition-all duration-300 ease-out"
        :style="{
          aspectRatio: `${slotRatio}`,
          borderRadius: `${slotBorderRadius}px`,
        }"
      >
        <!-- Live video -->
        <video
          ref="videoRef"
          class="w-full h-full object-cover scale-x-[-1]"
          autoplay muted playsinline
        />

        <!-- Viewfinder framing corners -->
        <div class="absolute inset-0 pointer-events-none border border-white/10 rounded-[inherit]">
          <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/40 rounded-tl-sm" />
          <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-white/40 rounded-tr-sm" />
          <div class="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-white/40 rounded-bl-sm" />
          <div class="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/40 rounded-br-sm" />
        </div>

        <!-- Shot counter badge -->
        <div
          v-if="sessionStore.totalShots > 1"
          class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/15 rounded-full px-3 py-1 pointer-events-none shadow-md"
        >
          <span class="font-mono text-xs font-bold text-zinc-200">
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
            class="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/25 backdrop-blur-[1px] pointer-events-none"
          >
            <!-- Microcopy -->
            <p class="text-sm font-bold tracking-[0.2em] uppercase text-amber-300 drop-shadow">{{ shotMicrocopy }}</p>

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
      </div>

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
        <button
          v-for="(photo, i) in sessionStore.photos"
          :key="i"
          type="button"
          class="w-12 h-14 rounded-[10px] border overflow-hidden flex items-center justify-center bg-black shrink-0 transition-all duration-200 relative"
          :class="{
            'border-emerald-500 hover:border-amber-400 cursor-pointer active:scale-95 shadow-sm': photo.dataUrl !== null && sessionStore.sessionState === 'READY',
            'border-amber-400 ring-2 ring-amber-400/30': photo.dataUrl === null && sessionStore.currentShot === i && !showResult,
            'border-zinc-800 opacity-60': photo.dataUrl === null && (sessionStore.currentShot !== i || showResult),
          }"
          :title="photo.dataUrl && sessionStore.sessionState === 'READY' ? `Klik untuk foto ulang jepretan ${i + 1}` : `Foto ke-${i + 1}`"
          @click="photo.dataUrl && sessionStore.sessionState === 'READY' ? sessionStore.retakeShot(i) : null"
        >
          <img v-if="photo.dataUrl" :src="photo.dataUrl" class="w-full h-full object-cover" alt="" />
          <span v-else class="text-xs font-mono font-bold text-zinc-600">{{ i + 1 }}</span>
        </button>
      </div>

      <!-- Actions -->
      <div class="flex flex-col gap-2.5 flex-1 min-w-0">

        <!-- READY -->
        <template v-if="sessionStore.sessionState === 'READY'">
          <p class="text-xs font-semibold text-zinc-400 text-center">{{ shotHeadline }}</p>
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
            class="flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
            @click="sessionStore.retakeShot()"
          >
            <Icon name="lucide:rotate-ccw" class="w-3.5 h-3.5" />
            Foto Ulang Jepretan Ini
          </button>
        </template>

        <!-- COUNTDOWN -->
        <template v-if="sessionStore.sessionState === 'COUNTDOWN'">
          <p class="text-sm text-zinc-400 text-center animate-pulse">Bersiap…</p>
        </template>

        <!-- PREVIEW -->
        <template v-if="sessionStore.sessionState === 'PREVIEW'">
          <p class="text-sm font-bold text-zinc-100 text-center">Hasil Foto</p>

          <button
            class="w-full mt-2 py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.97] text-zinc-950 text-base font-bold transition-all flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(245,158,11,0.25)] min-h-[52px]"
            @click="handleFinish"
          >
            <span>Selesai</span>
            <Icon name="lucide:check" class="w-5 h-5" />
          </button>

          <div class="flex items-center justify-center gap-2 pt-1">
            <button
              class="flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
              @click="handleRetake"
            >
              <Icon name="lucide:rotate-ccw" class="w-3.5 h-3.5" />
              Foto Ulang Semua
            </button>
          </div>
        </template>

        <!-- DONE -->
        <template v-if="sessionStore.sessionState === 'DONE'">
          <div class="flex flex-col items-center gap-3 w-full">
            <div class="flex flex-col items-center gap-0.5 text-center">
              <span v-if="hasCustomEvent" class="text-xs font-bold text-amber-400">
                {{ eventName }}
              </span>
              <p class="text-xs font-semibold text-zinc-200">Scan QR untuk download foto</p>
            </div>
            <div class="w-[clamp(140px,40%,200px)] aspect-square bg-white rounded-[14px] p-2 flex items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <img v-if="qrDataUrl" :src="qrDataUrl" class="w-full h-full object-contain" alt="QR Foto" />
              <Icon v-else name="lucide:loader-2" class="w-6 h-6 text-zinc-400 animate-spin" />
            </div>

            <!-- Email Backup Form -->
            <div class="w-full mt-1 flex flex-col gap-2">
              <p class="text-[11px] text-zinc-400 text-center">── atau masukkan email ──</p>
              <div v-if="emailSent" class="w-full py-3 px-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2 text-emerald-400 text-xs font-semibold">
                <Icon name="lucide:check-circle-2" class="w-4 h-4" />
                <span>Email berhasil disimpan ✓</span>
              </div>
              <div v-else class="flex items-center gap-2">
                <input
                  v-model="custEmail"
                  type="email"
                  placeholder="kenzie@gmail.com"
                  class="flex-1 px-3.5 py-3 rounded-2xl bg-zinc-950 border text-zinc-100 text-xs font-sans placeholder-zinc-500 outline-none transition-colors"
                  :class="emailError ? 'border-rose-500/60 focus:border-rose-500' : 'border-zinc-800 focus:border-amber-500'"
                  @input="emailError = false"
                  @keyup.enter="handleSendEmail"
                />
                <button
                  class="py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center min-w-[70px]"
                  :disabled="isSendingEmail || !custEmail"
                  @click="handleSendEmail"
                >
                  <Icon v-if="isSendingEmail" name="lucide:loader-2" class="w-3.5 h-3.5 animate-spin" />
                  <span v-else>Simpan</span>
                </button>
              </div>
              <span v-if="emailError" class="text-[10px] text-rose-400 text-center">{{ emailErrorMsg }}</span>
            </div>

            <div class="flex flex-col items-center gap-0.5 text-center mt-1">
              <p class="text-[11px] text-zinc-300 font-semibold">Foto akan dicetak oleh operator</p>
              <p class="text-[10px] text-zinc-500">Silakan ambil hasil cetak di meja operator</p>
            </div>
          </div>
        </template>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'
import { useSessionStore }  from '~/stores/session'
import { useTemplateStore } from '~/stores/template'
import { renderTemplate }   from '~/services/renderer'
import { settingsDB }       from '~/services/db'
import type { PhotoElement, PhotoTemplate } from '~/types/template'

definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Sesi Foto — RD Photobooth' })

const router       = useRouter()
const sessionStore = useSessionStore()
const templateStore = useTemplateStore()

const eventName  = ref('')
const cdDuration = ref(5)
const isLandscape = ref(false)

const hasCustomEvent = computed(() =>
  Boolean(eventName.value && eventName.value.trim().toLowerCase() !== 'rd photobooth')
)

const activePhotoSlot = computed<PhotoElement | null>(() => {
  const tpl = templateStore.active
  if (!tpl) return null
  const shotIdx = sessionStore.currentShot ?? 0
  const slotEl = tpl.elements.find((el): el is PhotoElement => el.type === 'photo' && el.slot === shotIdx)
  if (slotEl) return slotEl
  return tpl.elements.find((el): el is PhotoElement => el.type === 'photo') || null
})

const slotRatio = computed(() => {
  if (!activePhotoSlot.value || !activePhotoSlot.value.width || !activePhotoSlot.value.height) {
    return 4 / 3
  }
  return activePhotoSlot.value.width / activePhotoSlot.value.height
})

const slotBorderRadius = computed(() => {
  if (!activePhotoSlot.value?.borderRadius) return 16
  return Math.min(24, Math.max(8, activePhotoSlot.value.borderRadius * 2))
})

function updateOrientation() {
  isLandscape.value = window.matchMedia('(orientation: landscape)').matches
}

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
    const savedCameraId = (await settingsDB.get<string>('selectedCameraId'))
      || (typeof localStorage !== 'undefined' ? localStorage.getItem('photobooth_camera_id') : '') || ''

    let mediaStream: MediaStream | null = null

    if (savedCameraId) {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: savedCameraId },
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
          },
          audio: false,
        })
      } catch {
        // Fallback jika deviceId tidak ditemukan
      }
    }

    if (!mediaStream) {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1920, min: 640 }, height: { ideal: 1080, min: 480 }, facingMode: 'user' },
          audio: false,
        })
      } catch {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      }
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
  if (countdownVal.value === 1) return 'SENYUM!'
  if (t === 1) return 'SIAP!'
  if (i === 0) return 'FOTO 1'
  if (i === t - 1) return 'TERAKHIR!'
  return `FOTO ${i + 1}`
})

const shotHeadline = computed(() => {
  const i = sessionStore.currentShot; const t = sessionStore.totalShots
  if (t === 1) return 'Bersiap di depan kamera'
  if (i === 0) return `Foto 1 dari ${t}`
  if (i === t - 1) return `Foto terakhir! (${t} dari ${t})`
  return `Foto ${i + 1} dari ${t}`
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

// ── Customer Info & Finish ─────────────────────────────────────
const custEmail         = ref('')
const emailError        = ref(false)
const emailErrorMsg     = ref('Email wajib diisi.')

const emailSent         = ref(false)
const isSendingEmail    = ref(false)
const qrDataUrl         = ref('')

function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

async function generateQRCode(url: string) {
  try {
    qrDataUrl.value = await QRCode.toDataURL(url, { width: 240, margin: 1.5, color: { dark: '#09090b', light: '#ffffff' } })
  } catch (err) { console.error('QR generation failed:', err) }
}

async function handleFinish() {
  // Move to DONE and show QR
  await sessionStore.finishSession()
  if (sessionStore.current?.id && typeof window !== 'undefined') {
    const downloadUrl = `${window.location.origin}/download/${sessionStore.current.id}`
    await generateQRCode(downloadUrl)
  }
}

async function handleSendEmail() {
  const email = custEmail.value.trim()
  emailError.value = false

  if (!email) {
    emailErrorMsg.value = 'Email wajib diisi'
    emailError.value = true
    return
  }
  if (!isEmailValid(email)) {
    emailErrorMsg.value = 'Format email tidak valid'
    emailError.value = true
    return
  }

  isSendingEmail.value = true
  try {
    // Save email as backup. Name is not required anymore.
    await sessionStore.setCustomerInfo('Guest', email)
    emailSent.value = true
  } finally {
    isSendingEmail.value = false
  }
}

// ── Retake / Cancel ────────────────────────────────────────────
async function handleRetake() {
  custEmail.value = ''; emailError.value = false; emailSent.value = false
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

