<template>
  <div class="w-full h-full relative overflow-hidden bg-zinc-950 flex flex-col select-none">


    <!-- ── Template picker overlay ─────────────────────────── -->
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showPicker" class="absolute inset-0 z-50 bg-zinc-950 flex items-center justify-center">
        <TemplatePicker
          @selected="onTemplatePicked"
          @back="onBackFromPicker"
        />
      </div>
    </Transition>

    <!-- ── Capture flash ──────────────────────────────────── -->
    <Transition
      enter-active-class="transition-opacity duration-100 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showFlash" class="fixed inset-0 bg-white pointer-events-none z-[100]" />
    </Transition>

    <!-- ── Processing overlay ─────────────────────────────── -->
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="sessionStore.sessionState === 'PROCESSING'" class="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-black/85 backdrop-blur-md">
        <div class="w-10 h-10 border-4 border-zinc-700 border-t-amber-400 rounded-full animate-spin" />
        <p class="text-sm font-semibold text-zinc-300">Memproses template foto…</p>
      </div>
    </Transition>

    <!-- ── Main layout (Camera / Result + Control Panel) ───── -->
    <div class="flex-1 grid grid-cols-1 md:grid-cols-[1fr_320px] overflow-hidden">

      <!-- Left: Camera / Preview Area -->
      <div class="relative flex flex-col overflow-hidden bg-black">
        <div class="flex-1 relative overflow-hidden bg-zinc-950 flex items-center justify-center">

          <!-- Live webcam -->
          <video
            v-show="showLiveCamera"
            ref="videoRef"
            class="w-full h-full object-cover -scale-x-100"
            autoplay muted playsinline
          />

          <!-- ── Countdown (Placed directly inside camera frame, no blur) ── -->
          <Transition
            enter-active-class="transition-opacity duration-200 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div
              v-if="sessionStore.sessionState === 'COUNTDOWN'"
              class="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
            >
              <div class="relative flex items-center justify-center bg-black/45 rounded-full p-2 border border-amber-500/40 shadow-2xl">
                <!-- Circular countdown ring -->
                <svg class="w-28 h-28 sm:w-36 sm:h-36 -rotate-90" viewBox="0 0 120 120">
                  <circle class="stroke-black/50" cx="60" cy="60" r="54" fill="none" stroke-width="6" />
                  <circle
                    class="stroke-amber-400 transition-[stroke-dashoffset] duration-1000 ease-linear"
                    cx="60" cy="60" r="54"
                    fill="none"
                    stroke-width="6"
                    stroke-linecap="round"
                    :stroke-dasharray="CIRCUMFERENCE"
                    :stroke-dashoffset="ringOffset"
                  />
                </svg>
                <!-- Countdown Number -->
                <div class="absolute inset-0 flex items-center justify-center font-mono text-5xl sm:text-7xl font-extrabold text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]">
                  <span v-if="countdownVal > 0">{{ countdownVal }}</span>
                  <Icon v-else name="lucide:camera" class="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 animate-pulse" />
                </div>
              </div>
            </div>
          </Transition>


          <!-- Shot counter -->
          <div v-if="showLiveCamera && sessionStore.totalShots > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-xs text-white/60 font-bold pointer-events-none">
            {{ sessionStore.currentShot + 1 }} / {{ sessionStore.totalShots }}
          </div>

          <!-- Result preview -->
          <div v-if="showResult" class="w-full h-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-zinc-950">
            <img
              v-if="sessionStore.current?.outputUrl"
              :src="sessionStore.current.outputUrl"
              class="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              alt="Hasil foto"
            />
          </div>

        </div>


      </div>

      <!-- Right: Control Panel -->
      <div class="bg-zinc-900 border-t md:border-t-0 md:border-l border-zinc-800 p-5 sm:p-6 flex flex-col items-center justify-between gap-4 overflow-y-auto">

        <!-- Top: Shot thumbnails row & State info -->
        <div class="w-full flex flex-col items-center gap-2.5">
          <!-- Shot Pips -->
          <div class="flex items-center justify-center gap-2 w-full">
            <div
              v-for="(photo, i) in sessionStore.photos"
              :key="i"
              class="w-14 h-16 rounded-xl border bg-zinc-950 flex items-center justify-center overflow-hidden relative transition-colors duration-200"
              :class="{
                'border-emerald-500/70': photo.dataUrl !== null,
                'border-amber-500': sessionStore.currentShot === i && !showResult,
                'border-zinc-800': photo.dataUrl === null && (sessionStore.currentShot !== i || showResult),
              }"
            >
              <img
                v-if="photo.dataUrl"
                :src="photo.dataUrl"
                class="w-full h-full object-cover"
                alt=""
              />
              <span v-else class="text-xs font-mono font-bold text-zinc-500">{{ i + 1 }}</span>
            </div>
          </div>

          <!-- State label -->
          <span class="text-[10px] font-mono font-bold text-zinc-600 tracking-[0.15em] uppercase">{{ stateLabel }}</span>
        </div>

        <!-- Middle: Action Buttons / Form -->
        <div class="w-full flex flex-col gap-3">

          <!-- READY -->
          <template v-if="sessionStore.sessionState === 'READY'">
            <button
              id="btn-ready"
              class="w-full py-4 sm:py-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-base sm:text-lg transition-all duration-150 active:scale-[0.97] flex items-center justify-center gap-3 min-h-[56px] shadow-[0_4px_24px_rgba(245,158,11,0.2)]"
              @click="startCountdown"
            >
              <Icon name="lucide:camera" class="w-5 h-5 shrink-0" />
              <span>Ambil Foto</span>
            </button>

            <button
              v-if="sessionStore.currentShot > 0"
              class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center gap-1.5 py-2"
              @click="sessionStore.retakeShot()"
            >
              <Icon name="lucide:rotate-ccw" class="w-3.5 h-3.5" />
              <span>Foto Ulang</span>
            </button>
          </template>

          <!-- PREVIEW -->
          <template v-if="sessionStore.sessionState === 'PREVIEW'">
            <div class="w-full flex flex-col gap-3">
              <!-- Nama -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-zinc-400" for="cust-name">Nama</label>
                <input
                  id="cust-name"
                  v-model="custName"
                  type="text"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-zinc-950 border text-zinc-100 text-sm outline-none transition-colors"
                  :class="nameError ? 'border-rose-500/70' : 'border-zinc-800 focus:border-amber-500/70'"
                  placeholder="Nama kamu"
                  maxlength="50"
                  @input="nameError = false"
                />
                <span v-if="nameError" class="text-[11px] text-rose-400">Nama wajib diisi.</span>
              </div>

              <!-- Email -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-zinc-400" for="cust-email">Email</label>
                <input
                  id="cust-email"
                  v-model="custEmail"
                  type="email"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-zinc-950 border text-zinc-100 text-sm outline-none transition-colors"
                  :class="emailError ? 'border-rose-500/70' : 'border-zinc-800 focus:border-amber-500/70'"
                  placeholder="nama@email.com"
                  maxlength="60"
                  @input="emailError = false"
                />
                <span v-if="emailError" class="text-[11px] text-rose-400">Email tidak valid.</span>
              </div>

              <!-- CTA -->
              <button
                id="btn-save-finish"
                class="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-base transition-all duration-150 active:scale-[0.97] shadow-[0_4px_20px_rgba(245,158,11,0.18)] mt-1"
                @click="handleSaveAndFinish"
              >
                Selesai
              </button>

              <button
                class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center gap-1.5 py-1"
                @click="handleRetake"
              >
                <Icon name="lucide:rotate-ccw" class="w-3.5 h-3.5" />
                Foto Ulang
              </button>
            </div>
          </template>

          <!-- DONE -->
          <template v-if="sessionStore.sessionState === 'DONE'">
            <div class="w-full flex flex-col items-center gap-4">

              <!-- QR Code -->
              <div class="p-3 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <img
                  v-if="qrDataUrl"
                  :src="qrDataUrl"
                  class="w-44 h-44 sm:w-48 sm:h-48 object-contain"
                  alt="QR Foto"
                />
                <div v-else class="w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
                  <Icon name="lucide:loader-2" class="w-7 h-7 text-zinc-400 animate-spin" />
                </div>
              </div>

              <div class="text-center flex flex-col gap-1">
                <p class="text-sm font-semibold text-zinc-200">Scan untuk softfile foto</p>
                <p class="text-xs text-zinc-500">Ambil cetakan di meja operator</p>
              </div>

            </div>
          </template>

        </div>

        <!-- Bottom: Cancel / Back Button -->
        <button
          v-if="sessionStore.sessionState === 'READY' || sessionStore.sessionState === 'PREVIEW'"
          class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-1 mt-auto flex items-center gap-1"
          @click="handleCancel"
        >
          <Icon name="lucide:arrow-left" class="w-3 h-3" />
          <span>Batal</span>
        </button>

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
import type { PhotoTemplate } from '~/types/template'

definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Photobooth — Sesi Foto' })

const router        = useRouter()
const sessionStore  = useSessionStore()
const templateStore = useTemplateStore()

// ─── Event name & countdown from settings ─────────────────────
const eventName    = ref('')
const cdDuration   = ref(5)

// ─── Template picker & Remote Reset Listener ─────────────────
const showPicker = ref(false)
let remoteCommandTimer: ReturnType<typeof setInterval> | null = null
let initialCmdVersion = 0
let initialCmdNonce   = ''

onMounted(async () => {
  if (!sessionStore.current) { await router.replace('/'); return }

  // Record initial command state on mount
  try {
    const initCmd = await $fetch<{ version?: number; nonce?: string }>('/api/kiosk/command').catch(() => null)
    initialCmdVersion = initCmd?.version ?? 0
    initialCmdNonce   = initCmd?.nonce ?? ''
  } catch {
    // Offline
  }

  const dbEvent    = await settingsDB.get<string>('activeEventName')
  const localEvent = typeof localStorage !== 'undefined' ? localStorage.getItem('photobooth_event_name') : null
  eventName.value  = sessionStore.current.eventName || dbEvent || localEvent || 'RD Photobooth'

  if (!sessionStore.current.eventName && eventName.value) {
    sessionStore.current.eventName = eventName.value
  }

  cdDuration.value = sessionStore.configuredCountdown || (await settingsDB.get<number>('activeCountdown')) || 5

  await templateStore.loadTemplates()
  showPicker.value = true
  initCamera()

  window.addEventListener('keydown', onKeyDown)

  // Robust polling for remote operator reset commands
  remoteCommandTimer = setInterval(async () => {
    try {
      const cmd = await $fetch<{ action: string; version?: number; nonce?: string }>('/api/kiosk/command').catch(() => null)
      if (!cmd || cmd.action !== 'reset_home') return

      const isNewVersion = (cmd.version !== undefined && cmd.version > initialCmdVersion)
      const isNewNonce   = Boolean(cmd.nonce && cmd.nonce !== initialCmdNonce)

      if (isNewVersion || isNewNonce) {
        console.log('[Kiosk] Remote reset received from operator:', cmd)
        resetToHome()
      }
    } catch {
      // Offline/ignore
    }
  }, 1000)
})

onUnmounted(() => {
  if (remoteCommandTimer) {
    clearInterval(remoteCommandTimer)
    remoteCommandTimer = null
  }
})

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

async function onSkipTemplate() {
  showPicker.value = false
  if (templateStore.templates.length) {
    const tpl = templateStore.templates.find(t => t.totalSlots === sessionStore.totalShots) || templateStore.templates[0]
    templateStore.setActive(tpl)
    if (sessionStore.current) {
      sessionStore.current.templateId = tpl.id
    }
  }
  await initCamera()
}

async function onBackFromPicker() {
  showPicker.value = false
  await sessionStore.resetSession()
  await router.replace('/setup')
}

// ─── Camera ───────────────────────────────────────────────────
const videoRef   = ref<HTMLVideoElement | null>(null)
let   stream: MediaStream | null = null

async function initCamera() {
  await nextTick()

  // If already playing stream, re-attach and continue
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
      // Fallback with minimal constraints
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })
    }

    stream = mediaStream

    if (videoRef.value && stream) {
      videoRef.value.srcObject = stream
      videoRef.value.onloadedmetadata = () => {
        videoRef.value?.play().catch(e => console.warn('Video play warning:', e))
      }
      await videoRef.value.play().catch(() => {})
    }
  } catch (err) {
    console.warn('[Camera] Real webcam not accessible, using mock simulation:', err)
    initMockStream()
  }
}

function initMockStream() {
  const canvas = document.createElement('canvas')
  canvas.width  = 1280
  canvas.height = 960
  const ctx = canvas.getContext('2d')!

  function draw() {
    ctx.fillStyle = '#141416'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#f59e0b'
    ctx.font      = 'bold 44px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('📷 RD PHOTOBOOTH', canvas.width / 2, canvas.height / 2 - 20)
    ctx.fillStyle = '#71717a'
    ctx.font      = '24px Inter, sans-serif'
    ctx.fillText('Mode Simulasi Kamera', canvas.width / 2, canvas.height / 2 + 30)
    requestAnimationFrame(draw)
  }
  draw()

  const mockStream = (canvas as any).captureStream?.(30)
  if (mockStream && videoRef.value) {
    videoRef.value.srcObject = mockStream
    videoRef.value.play().catch(() => {})
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop())
    stream = null
  }
}

onUnmounted(() => {
  clearTimer()
  stopCamera()
  if (remoteCommandTimer) clearInterval(remoteCommandTimer)
  window.removeEventListener('keydown', onKeyDown)
})

// ─── Countdown ────────────────────────────────────────────────
const countdownVal = ref(0)
let   timer: ReturnType<typeof setInterval> | null = null

const CIRCUMFERENCE = 2 * Math.PI * 54
const ringOffset = computed(() => {
  const progress = countdownVal.value / cdDuration.value
  return CIRCUMFERENCE * (1 - progress)
})

function clearTimer() {
  if (timer) { clearInterval(timer); timer = null }
}

async function startCountdown() {
  countdownVal.value = cdDuration.value
  await sessionStore.startCountdown()

  timer = setInterval(async () => {
    countdownVal.value--
    if (countdownVal.value <= 0) {
      clearTimer()
      await capturePhoto()
    }
  }, 1000)
}

// ─── Capture ──────────────────────────────────────────────────
const showFlash = ref(false)

async function capturePhoto() {
  // Flash
  showFlash.value = true
  setTimeout(() => { showFlash.value = false }, 350)

  const dataUrl = grabFrame()
  await sessionStore.capturePhoto(dataUrl)

  // If all shots captured, process into final template
  if (sessionStore.sessionState === 'PROCESSING') {
    await processPhotos()
  }
}

function grabFrame(): string {
  const video = videoRef.value
  if (!video) return ''
  const canvas = document.createElement('canvas')
  canvas.width  = video.videoWidth  || 1280
  canvas.height = video.videoHeight || 960
  const ctx = canvas.getContext('2d')!
  ctx.translate(canvas.width, 0)
  ctx.scale(-1, 1) // mirror selfie
  ctx.drawImage(video, 0, 0)
  return canvas.toDataURL('image/jpeg', 0.93)
}

// ─── Processing ───────────────────────────────────────────────
async function processPhotos() {
  const photosMap: Record<number, string> = {}
  sessionStore.photos.forEach((p, i) => { if (p.dataUrl) photosMap[i] = p.dataUrl })

  const currentEvent = eventName.value || (await settingsDB.get<string>('activeEventName')) || ''

  const tpl = templateStore.active
  if (tpl) {
    const result = await renderTemplate(tpl, {
      photos: photosMap,
      scale: 1,
      eventName: currentEvent,
    })
    await sessionStore.setOutput(result.dataUrl)
  } else {
    await sessionStore.setOutput(photosMap[0] ?? '')
  }
}

// ─── Customer Info & Finish Flow ───────────────────────────────
const custName   = ref('')
const custEmail  = ref('')
const nameError  = ref(false)
const emailError = ref(false)

function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

const qrDataUrl = ref<string>('')

async function generateQRCode(url: string) {
  try {
    qrDataUrl.value = await QRCode.toDataURL(url, {
      width: 256,
      margin: 1.5,
      color: {
        dark: '#09090b',
        light: '#ffffff',
      },
    })
  } catch (err) {
    console.error('Failed to generate QR:', err)
  }
}

async function handleSaveAndFinish() {
  const name = custName.value.trim()
  const email = custEmail.value.trim()

  nameError.value = !name
  emailError.value = !isEmailValid(email)

  if (nameError.value || emailError.value) {
    return
  }

  // Save customer name and email purely as session metadata for admin archives
  await sessionStore.setCustomerInfo(name, email)
  await sessionStore.finishSession()

  // Generate QR Code for guest instant mobile download
  if (sessionStore.current?.id && typeof window !== 'undefined') {
    const downloadUrl = `${window.location.origin}/download/${sessionStore.current.id}`
    await generateQRCode(downloadUrl)
  }
}

// ─── Operator Reset (Corner tap or Key press) ──────────────────
let opTapCount = 0
let opTapTimer: ReturnType<typeof setTimeout> | null = null

function handleOperatorReset() {
  opTapCount++
  if (opTapTimer) clearTimeout(opTapTimer)
  opTapTimer = setTimeout(() => { opTapCount = 0 }, 1500)

  // 3 taps or 1 tap when session is already DONE
  if (opTapCount >= 3 || sessionStore.sessionState === 'DONE') {
    opTapCount = 0
    resetToHome()
  }
}

function onKeyDown(e: KeyboardEvent) {
  if (sessionStore.sessionState === 'DONE') {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      resetToHome()
    }
  }
}

async function resetToHome() {
  await sessionStore.resetSession()
  await router.replace('/')
}

// ─── Retake / Cancel ──────────────────────────────────────────
async function handleRetake() {
  custName.value = ''
  custEmail.value = ''
  await sessionStore.startSession({ totalShots: sessionStore.totalShots })
  showPicker.value = true
}

async function handleCancel() {
  await sessionStore.resetSession()
  await router.replace('/')
}

// ─── UI helpers ───────────────────────────────────────────────
const showLiveCamera = computed(() =>
  !showResult.value
)

const showResult = computed(() =>
  sessionStore.sessionState === 'PREVIEW' ||
  sessionStore.sessionState === 'PRINT' ||
  sessionStore.sessionState === 'DONE'
)

const stateLabel = computed(() => ({
  IDLE:       'IDLE',
  READY:      `SIAP — FOTO ${sessionStore.currentShot + 1}/${sessionStore.totalShots}`,
  COUNTDOWN:  'HITUNG MUNDUR',
  CAPTURE:    'POTRET',
  PROCESSING: 'MEMPROSES',
  PREVIEW:    'PRATINJAU',
  PRINT:      'MENCETAK',
  DONE:       'SELESAI',
}[sessionStore.sessionState] ?? sessionStore.sessionState))

const instruction = computed(() => {
  if (sessionStore.sessionState === 'READY') {
    if (sessionStore.currentShot === 0) {
      return `Siap untuk foto ke-1 dari ${sessionStore.totalShots}. Tekan tombol untuk mulai.`
    }
    return `Foto ke-${sessionStore.currentShot} tersimpan. Bersiap untuk foto ke-${sessionStore.currentShot + 1}.`
  }

  return {
    COUNTDOWN:  'Bersiap di depan kamera...',
    CAPTURE:    '',
    PROCESSING: 'Memproses bingkai foto...',
    PREVIEW:    'Lengkapi data tamu untuk softfile foto.',
    PRINT:      'Mencetak foto...',
    DONE:       '',
  }[sessionStore.sessionState] ?? ''
})
</script>
