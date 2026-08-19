<template>
  <div class="max-w-7xl mx-auto flex flex-col gap-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-zinc-100">Perangkat</h1>
        <p class="text-xs sm:text-sm text-zinc-400">Status kamera, printer, dan memori lokal</p>
      </div>

      <button
        type="button"
        @click="checkAllDiagnostics"
        :disabled="isChecking"
        class="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 text-xs font-bold transition-all active:scale-95 flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
      >
        <Icon name="lucide:refresh-cw" class="w-4 h-4" :class="isChecking ? 'animate-spin' : ''" />
        <span>Periksa Perangkat</span>
      </button>
    </div>

    <!-- Device Cards Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- ── 1. Kamera ────────────────────────────────────────── -->
      <div class="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between gap-5 shadow-lg">
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 shrink-0">
                <Icon name="lucide:camera" class="w-5 h-5" />
              </div>
              <h2 class="text-base font-bold text-zinc-100">Kamera</h2>
            </div>

            <span
              class="text-xs font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 shrink-0"
              :class="cameraStatus.connected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="cameraStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'" />
              {{ cameraStatus.connected ? 'Connected' : 'Offline' }}
            </span>
          </div>

          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold text-zinc-400">Perangkat Aktif:</p>
            <p class="text-sm font-bold text-zinc-100 truncate">{{ cameraStatus.detail }}</p>
          </div>

          <!-- Camera Selector (Admin only) -->
          <div v-if="auth.isAdmin.value && cameraDevices.length > 0" class="flex flex-col gap-1.5 pt-2 border-t border-zinc-800">
            <label for="camera-device-select" class="text-xs text-zinc-400">Pilih Kamera</label>
            <select
              id="camera-device-select"
              v-model="selectedCameraId"
              @change="onSelectCamera"
              class="bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs rounded-xl p-2.5 focus:ring-amber-500 focus:border-amber-500 outline-none"
            >
              <option v-for="(cam, idx) in cameraDevices" :key="cam.deviceId || idx" :value="cam.deviceId">
                {{ cam.label || `Kamera ${idx + 1}` }}
              </option>
            </select>
          </div>

          <!-- Live Camera Preview Box -->
          <div v-if="isTestingCamera" class="w-full aspect-video bg-black rounded-xl overflow-hidden relative border border-zinc-800 flex items-center justify-center">
            <video ref="testVideoRef" autoplay playsinline muted class="w-full h-full object-cover scale-x-[-1]" />
            <span class="absolute top-2 left-2 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
            </span>
          </div>
        </div>

        <button
          type="button"
          @click="toggleCameraTest"
          class="w-full py-2.5 px-4 rounded-xl border text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
          :class="isTestingCamera
            ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
            : 'bg-amber-500 border-amber-500 text-zinc-950 hover:bg-amber-400'"
        >
          <Icon :name="isTestingCamera ? 'lucide:video-off' : 'lucide:video'" class="w-4 h-4" />
          <span>{{ isTestingCamera ? 'Tutup Kamera' : 'Tes Kamera' }}</span>
        </button>
      </div>

      <!-- ── 2. Printer ───────────────────────────────────────── -->
      <div class="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between gap-5 shadow-lg">
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 shrink-0">
                <Icon name="lucide:printer" class="w-5 h-5" />
              </div>
              <h2 class="text-base font-bold text-zinc-100">Printer</h2>
            </div>

            <span
              class="text-xs font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 shrink-0"
              :class="printerStatus.ready
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="printerStatus.ready ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'" />
              {{ printerStatus.ready ? 'Ready' : 'Queue Busy' }}
            </span>
          </div>

          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold text-zinc-400">Status Print Engine:</p>
            <p class="text-sm font-bold text-zinc-100 truncate">{{ printerStatus.detail }}</p>
          </div>

          <div class="p-3 bg-zinc-800/80 rounded-xl border border-zinc-700/60 flex items-center justify-between text-xs">
            <span class="text-zinc-400">Antrean Aktif:</span>
            <span class="font-mono font-bold text-zinc-200">{{ pendingPrintCount }} job</span>
          </div>

          <p v-if="printTestFeedback" class="text-xs font-medium text-emerald-400 text-center">
            {{ printTestFeedback }}
          </p>
        </div>

        <button
          type="button"
          @click="triggerTestPrint"
          :disabled="isTestingPrint"
          class="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Icon v-if="isTestingPrint" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <Icon v-else name="lucide:printer" class="w-4 h-4" />
          <span>{{ isTestingPrint ? 'Mengirim…' : 'Tes Cetak' }}</span>
        </button>
      </div>

      <!-- ── 3. Database & Storage ────────────────────────────── -->
      <div class="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between gap-5 shadow-lg">
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 shrink-0">
                <Icon name="lucide:database" class="w-5 h-5" />
              </div>
              <h2 class="text-base font-bold text-zinc-100">Penyimpanan</h2>
            </div>

            <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shrink-0">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Aktif
            </span>
          </div>

          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold text-zinc-400">Database Sistem:</p>
            <p class="text-sm font-bold text-zinc-100">IndexedDB Lokal</p>
          </div>

          <div class="flex flex-col gap-2">
            <div class="p-3 bg-zinc-800/80 rounded-xl border border-zinc-700/60 flex items-center justify-between text-xs">
              <span class="text-zinc-400">Memori Terpakai:</span>
              <span class="font-mono font-bold text-zinc-200">{{ storageInfo.usedMb }} MB</span>
            </div>

            <div class="p-3 bg-zinc-800/80 rounded-xl border border-zinc-700/60 flex items-center justify-between text-xs">
              <span class="text-zinc-400">Total Sesi:</span>
              <span class="font-mono font-bold text-zinc-200">{{ sessionStore.history.length }} Sesi</span>
            </div>
          </div>
        </div>

        <NuxtLink
          to="/admin/sessions"
          class="w-full py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 active:scale-95 text-zinc-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
        >
          <Icon name="lucide:archive" class="w-4 h-4" />
          <span>Riwayat Sesi</span>
        </NuxtLink>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { settingsDB }                          from '~/services/db'
import { useAuth }                             from '~/composables/useAuth'
import { useSessionStore }                     from '~/stores/session'
import { printImage, generateTestPrintPattern } from '~/services/printer'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Perangkat — RD Photobooth' })

const auth         = useAuth()
const sessionStore = useSessionStore()

const isChecking        = ref(false)
const isTestingCamera   = ref(false)
const isTestingPrint    = ref(false)
const printTestFeedback = ref('')
const selectedCameraId  = ref('')

interface CameraItem {
  deviceId: string
  label: string
}
const cameraDevices = ref<CameraItem[]>([])
const testVideoRef  = ref<HTMLVideoElement | null>(null)
let testStream: MediaStream | null = null

const cameraStatus = ref({
  connected: false,
  detail: 'Memeriksa…',
})

const printerStatus = ref({
  ready: true,
  detail: 'Print engine siap',
})

const storageInfo = ref({
  usedMb: '0.0',
})

const pendingPrintCount = computed(() => {
  return sessionStore.printQueue.filter(j => j.status === 'PRINTING' || j.status === 'QUEUED').length
})

async function checkAllDiagnostics() {
  isChecking.value = true
  try {
    // 1. Camera Diagnostics
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      try {
        let devs = await navigator.mediaDevices.enumerateDevices()
        let videoInputs = devs.filter(d => d.kind === 'videoinput')

        if (videoInputs.length > 0 && !videoInputs[0].label) {
          try {
            const temp = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            devs = await navigator.mediaDevices.enumerateDevices()
            videoInputs = devs.filter(d => d.kind === 'videoinput')
            temp.getTracks().forEach(t => t.stop())
          } catch { /* ignore */ }
        }

        cameraDevices.value = videoInputs.map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label || `Kamera ${i + 1}`,
        }))

        const savedCam = (await settingsDB.get<string>('selectedCameraId')) || cameraDevices.value[0]?.deviceId || ''
        selectedCameraId.value = savedCam

        if (cameraDevices.value.length > 0) {
          const activeCam = cameraDevices.value.find(c => c.deviceId === savedCam) || cameraDevices.value[0]
          cameraStatus.value = {
            connected: true,
            detail: activeCam.label ? activeCam.label.slice(0, 30) : `${cameraDevices.value.length} Kamera Terdeteksi`,
          }
        } else {
          cameraStatus.value = {
            connected: false,
            detail: 'Tidak ada kamera terhubung',
          }
        }
      } catch {
        cameraStatus.value = {
          connected: false,
          detail: 'Izin kamera belum aktif',
        }
      }
    }

    // 2. Printer Diagnostics
    if (pendingPrintCount.value > 0) {
      printerStatus.value = {
        ready: false,
        detail: `${pendingPrintCount.value} job dalam antrean`,
      }
    } else {
      printerStatus.value = {
        ready: true,
        detail: 'Browser/OS print engine siap',
      }
    }

    // 3. Storage Diagnostics
    if (typeof navigator !== 'undefined' && (navigator as any).storage?.estimate) {
      try {
        const est = await (navigator as any).storage.estimate()
        storageInfo.value.usedMb = ((est.usage || 0) / (1024 * 1024)).toFixed(1)
      } catch { /* ignore */ }
    }
  } finally {
    isChecking.value = false
  }
}

async function onSelectCamera() {
  if (selectedCameraId.value) {
    await settingsDB.set('selectedCameraId', selectedCameraId.value)
    if (typeof localStorage !== 'undefined') localStorage.setItem('photobooth_camera_id', selectedCameraId.value)
    if (isTestingCamera.value) {
      await startCameraTest()
    }
  }
}

async function toggleCameraTest() {
  if (isTestingCamera.value) {
    stopCameraTest()
  } else {
    await startCameraTest()
  }
}

async function startCameraTest() {
  stopCameraTest()
  isTestingCamera.value = true
  await nextTick()

  try {
    const constraints: MediaStreamConstraints = {
      video: selectedCameraId.value
        ? { deviceId: { exact: selectedCameraId.value }, width: { ideal: 1280 }, height: { ideal: 720 } }
        : { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    }
    testStream = await navigator.mediaDevices.getUserMedia(constraints)
    if (testVideoRef.value && testStream) {
      testVideoRef.value.srcObject = testStream
      await testVideoRef.value.play().catch(() => {})
    }
  } catch (err) {
    console.error('Camera test error:', err)
    stopCameraTest()
  }
}

function stopCameraTest() {
  if (testStream) {
    testStream.getTracks().forEach(t => t.stop())
    testStream = null
  }
  if (testVideoRef.value) {
    testVideoRef.value.srcObject = null
  }
  isTestingCamera.value = false
}

async function triggerTestPrint() {
  isTestingPrint.value = true
  printTestFeedback.value = ''
  try {
    const patternDataUrl = generateTestPrintPattern()
    if (!patternDataUrl) {
      printTestFeedback.value = 'Gagal membuat pola tes'
      return
    }
    const ok = await printImage(patternDataUrl, { title: 'RD Photobooth — Test Print' })
    if (ok) {
      printTestFeedback.value = '✓ Perintah cetak berhasil dikirim'
    } else {
      printTestFeedback.value = '✕ Cetak dibatalkan atau gagal'
    }
    setTimeout(() => { printTestFeedback.value = '' }, 3500)
  } catch (err) {
    console.error('Test print failed:', err)
    printTestFeedback.value = '✕ Terjadi kesalahan saat print'
  } finally {
    isTestingPrint.value = false
  }
}

onMounted(async () => {
  await auth.loadPins()
  await sessionStore.loadHistory()
  await checkAllDiagnostics()
})

onUnmounted(() => {
  stopCameraTest()
})
</script>
