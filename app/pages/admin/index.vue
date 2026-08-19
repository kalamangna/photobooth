<template>
  <div class="max-w-7xl mx-auto flex flex-col gap-6">

    <!-- ── Top Status Banner ─────────────────────────────────── -->
    <div class="p-5 sm:p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <Icon name="lucide:monitor" class="w-6 h-6" />
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span class="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">Booth Online</span>
          </div>
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
            {{ activeEventName || 'RD Photobooth' }}
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <span v-if="remoteFeedback" class="text-xs font-semibold" :class="remoteFeedback.startsWith('✓') ? 'text-emerald-400' : 'text-rose-400'">
          {{ remoteFeedback }}
        </span>

        <button
          type="button"
          @click="remoteResetTablet"
          :disabled="isResetting"
          class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Icon name="lucide:refresh-cw" class="w-4 h-4" :class="isResetting ? 'animate-spin' : ''" />
          <span>{{ isResetting ? 'Mereset...' : 'Reset Layar Booth' }}</span>
        </button>
      </div>
    </div>

    <!-- ── Operational Metrics & Devices ─────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- Kamera -->
      <NuxtLink to="/admin/devices" class="p-4 sm:p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors flex flex-col justify-between gap-3 shadow-md group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-zinc-400">Kamera</span>
          <span class="w-2 h-2 rounded-full" :class="cameraConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'" />
        </div>
        <div>
          <p class="text-base font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
            {{ cameraConnected ? 'Connected' : 'Offline' }}
          </p>
          <p class="text-[11px] text-zinc-500 truncate">{{ cameraLabel || 'Periksa perangkat' }}</p>
        </div>
      </NuxtLink>

      <!-- Printer -->
      <NuxtLink to="/admin/devices" class="p-4 sm:p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors flex flex-col justify-between gap-3 shadow-md group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-zinc-400">Printer</span>
          <span class="w-2 h-2 rounded-full" :class="printerReady ? 'bg-emerald-400' : 'bg-amber-400'" />
        </div>
        <div>
          <p class="text-base font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
            {{ printerReady ? 'Ready' : 'Queue Busy' }}
          </p>
          <p class="text-[11px] text-zinc-500">{{ pendingJobsCount > 0 ? `${pendingJobsCount} job antrean` : 'Print engine siap' }}</p>
        </div>
      </NuxtLink>

      <!-- Sesi Hari Ini -->
      <NuxtLink to="/admin/sessions" class="p-4 sm:p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors flex flex-col justify-between gap-3 shadow-md group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-zinc-400">Sesi Hari Ini</span>
          <Icon name="lucide:camera" class="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <p class="text-2xl font-black text-zinc-100 group-hover:text-amber-400 transition-colors">
            {{ todaySessions.length }}
          </p>
          <p class="text-[11px] text-zinc-500">{{ totalShotsToday }} foto diambil</p>
        </div>
      </NuxtLink>

      <!-- Total Print Selesai -->
      <div class="p-4 sm:p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between gap-3 shadow-md">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-zinc-400">Prints Hari Ini</span>
          <Icon name="lucide:printer" class="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <p class="text-2xl font-black text-zinc-100">
            {{ todayPrintsCount }}
          </p>
          <p class="text-[11px] text-zinc-500">Lembar tercetak</p>
        </div>
      </div>

    </div>

    <!-- ── Sesi Terkini (Operational Activity) ────────────────── -->
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-zinc-100">Sesi Terkini</h2>
          <p class="text-xs text-zinc-400">Aktivitas photobooth hari ini</p>
        </div>
        <NuxtLink
          to="/admin/sessions"
          class="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
        >
          <span>Lihat Semua Sesi</span>
          <Icon name="lucide:arrow-right" class="w-3.5 h-3.5" />
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div
        v-if="sessionStore.history.length === 0"
        class="py-12 px-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center gap-2"
      >
        <Icon name="lucide:image" class="w-8 h-8 text-zinc-600" />
        <p class="text-sm font-semibold text-zinc-300">Belum ada sesi foto yang tercatat</p>
      </div>

      <!-- Recent Cards Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="session in sessionStore.history.slice(0, 4)"
          :key="session.id"
          class="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-md hover:border-zinc-700 transition-colors"
        >
          <!-- Thumbnail & Info -->
          <div class="flex items-center gap-3">
            <div class="w-16 h-20 bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-zinc-800">
              <img
                v-if="session.outputUrl"
                :src="session.outputUrl"
                class="w-full h-full object-cover"
                alt="Preview"
              />
              <Icon v-else name="lucide:image" class="w-6 h-6 text-zinc-600" />
            </div>

            <div class="flex flex-col min-w-0 flex-1 gap-0.5">
              <span class="text-xs font-mono font-bold text-zinc-100 truncate">#{{ session.id }}</span>
              <p class="text-[11px] text-zinc-400 font-sans truncate">{{ session.customerEmail || 'Tanpa email' }}</p>
              <span class="text-[10px] text-zinc-500 font-mono">{{ formatTime(session.startedAt) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              @click="quickReprint(session.id)"
              :disabled="!session.outputUrl"
              class="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Icon name="lucide:printer" class="w-3.5 h-3.5" />
              <span>Cetak Foto</span>
            </button>

            <NuxtLink
              :to="`/admin/sessions`"
              class="py-2 px-3 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold transition-all"
              title="Detail Sesi"
            >
              <Icon name="lucide:eye" class="w-3.5 h-3.5" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import { settingsDB }      from '~/services/db'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Dashboard — RD Photobooth' })

const sessionStore    = useSessionStore()
const activeEventName = ref('')
const isResetting     = ref(false)
const remoteFeedback  = ref('')

const cameraConnected = ref(false)
const cameraLabel     = ref('')
const printerReady    = ref(true)

const todaySessions = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return sessionStore.history.filter(s => s.startedAt?.startsWith(today))
})

const totalShotsToday = computed(() => {
  return todaySessions.value.reduce((acc, s) => acc + (s.totalShots || 0), 0)
})

const todayPrintsCount = computed(() => {
  return todaySessions.value.reduce((acc, s) => {
    if (s.printCount && s.printCount > 0) return acc + s.printCount
    if (s.printedAt || s.printJobId) return acc + 1
    return acc
  }, 0)
})

const pendingJobsCount = computed(() => {
  return sessionStore.printQueue.filter(j => j.status === 'PRINTING' || j.status === 'QUEUED').length
})

async function checkQuickDiagnostics() {
  if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
    try {
      const devs = await navigator.mediaDevices.enumerateDevices()
      const cams = devs.filter(d => d.kind === 'videoinput')
      if (cams.length > 0) {
        cameraConnected.value = true
        cameraLabel.value     = cams[0].label || 'Kamera Terhubung'
      } else {
        cameraConnected.value = false
        cameraLabel.value     = 'Tidak ada kamera'
      }
    } catch {
      cameraConnected.value = false
      cameraLabel.value     = 'Izin kamera belum aktif'
    }
  }
}

async function remoteResetTablet() {
  isResetting.value    = true
  remoteFeedback.value = ''
  try {
    await $fetch('/api/kiosk/command', {
      method: 'POST',
      body: { action: 'reset_home' },
    })
    await sessionStore.resetSession()
    remoteFeedback.value = '✓ Layar berhasil direset'
    setTimeout(() => { remoteFeedback.value = '' }, 2500)
  } catch {
    remoteFeedback.value = '✕ Gagal mereset layar'
    setTimeout(() => { remoteFeedback.value = '' }, 2500)
  } finally {
    isResetting.value = false
  }
}

async function quickReprint(sessionId: string) {
  await sessionStore.reprintSession(sessionId, 1)
}

function formatTime(isoStr: string): string {
  if (!isoStr) return ''
  return new Date(isoStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  activeEventName.value = (await settingsDB.get<string>('activeEventName'))
    || (typeof localStorage !== 'undefined' ? localStorage.getItem('photobooth_event_name') : '')
    || 'RD Photobooth'

  await sessionStore.loadHistory()
  await checkQuickDiagnostics()
})
</script>
