<template>
  <div class="flex flex-col gap-6 sm:gap-8 pb-16 select-none text-zinc-100 max-w-7xl mx-auto">

    <!-- ── Top Header ──────────────────────────────────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
      <h1 class="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">Dashboard</h1>
    </div>

    <!-- ── Live Booth Control Banner ────────────────────────────── -->
    <div class="p-5 sm:p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg relative overflow-hidden">
      <!-- Ambient corner glow -->
      <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div class="flex items-start gap-4">
        <div class="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
          <Icon name="lucide:party-popper" class="w-5 h-5" />
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs font-mono font-semibold tracking-wider uppercase text-amber-400">Acara Aktif</span>
          <h2 class="text-lg font-bold text-zinc-100">
            {{ activeEventName || 'RD Photobooth' }}
          </h2>
        </div>
      </div>

      <!-- Quick Reset & Action -->
      <div class="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800/80">
        <Transition
          enter-active-class="transition-opacity duration-150"
          enter-from-class="opacity-0"
          leave-active-class="transition-opacity duration-100"
          leave-to-class="opacity-0"
        >
          <span v-if="remoteFeedback" class="text-xs font-semibold" :class="remoteFeedback.startsWith('✓') ? 'text-emerald-400' : 'text-rose-400'">
            {{ remoteFeedback }}
          </span>
        </Transition>

        <button
          id="btn-remote-reset"
          class="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm shadow-md shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-40"
          :disabled="isResetting"
          @click="remoteResetTablet"
        >
          <Icon name="lucide:refresh-cw" class="w-4 h-4" :class="isResetting ? 'animate-spin' : ''" />
          <span>{{ isResetting ? 'Mengirim…' : 'Reset Layar Booth' }}</span>
        </button>
      </div>
    </div>

    <!-- ── Key Metrics Cards ────────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-2">
        <div class="flex items-center justify-between text-zinc-400">
          <span class="text-sm font-medium">Sesi Hari Ini</span>
          <Icon name="lucide:camera" class="w-4 h-4 text-amber-400" />
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">{{ todaySessions.length }}</span>
          <span class="text-xs text-zinc-500">sesi</span>
        </div>
      </div>

      <div class="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-2">
        <div class="flex items-center justify-between text-zinc-400">
          <span class="text-sm font-medium">Total Foto Diambil</span>
          <Icon name="lucide:images" class="w-4 h-4 text-amber-400" />
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">{{ totalShotsToday }}</span>
          <span class="text-xs text-zinc-500">foto</span>
        </div>
      </div>

      <div v-if="auth.isAdmin.value" class="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-2">
        <div class="flex items-center justify-between text-zinc-400">
          <span class="text-sm font-medium">Total Riwayat Sesi</span>
          <Icon name="lucide:archive" class="w-4 h-4 text-amber-400" />
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">{{ sessionStore.history.length }}</span>
          <span class="text-xs text-zinc-500">keseluruhan</span>
        </div>
      </div>
    </div>

    <!-- ── Device Management Status (Admin only) ────────────────── -->
    <section v-if="auth.isAdmin.value" class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-bold font-mono tracking-wider uppercase text-zinc-400">
          Status Perangkat
        </h2>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          v-for="device in devices"
          :key="device.label"
          class="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-2.5"
        >
          <div class="flex items-center justify-between">
            <div class="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <Icon :name="device.icon" class="w-4 h-4" />
            </div>
            <span class="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-md">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {{ device.status }}
            </span>
          </div>

          <div class="flex flex-col">
            <span class="text-sm font-semibold text-zinc-100">{{ device.label }}</span>
            <span class="text-xs text-zinc-400">{{ device.detail }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Recent Sessions ────────────────────────────────────── -->
    <section class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-bold font-mono tracking-wider uppercase text-zinc-400">
          Sesi Terbaru
        </h2>
        <NuxtLink to="/gallery" class="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1">
          <span>Lihat Semua ({{ sessionStore.history.length }})</span>
          <Icon name="lucide:chevron-right" class="w-3.5 h-3.5" />
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div v-if="sessionStore.history.length === 0" class="p-10 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-zinc-500 text-sm">
        <Icon name="lucide:image" class="w-6 h-6 text-zinc-600" />
        <p>Belum ada sesi foto yang tersimpan.</p>
      </div>

      <!-- Grid Cards -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <div
          v-for="session in sessionStore.history.slice(0, 6)"
          :key="session.id"
          class="flex items-center gap-3.5 p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors group"
        >
          <div class="w-12 h-14 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
            <img v-if="session.outputUrl" :src="session.outputUrl" class="w-full h-full object-cover" alt="" />
            <Icon v-else name="lucide:image" class="w-5 h-5 text-zinc-600" />
          </div>

          <div class="flex flex-col min-w-0 flex-1">
            <span class="font-mono text-sm font-semibold text-zinc-100 truncate">
              {{ session.id }}
            </span>
            <span class="text-xs text-amber-400 font-medium truncate">
              {{ session.eventName || 'RD Photobooth' }}
            </span>
            <span class="text-xs text-zinc-400 mt-0.5">
              {{ formatDate(session.startedAt) }} · {{ session.totalShots }} Foto
            </span>
          </div>

          <NuxtLink
            to="/gallery"
            class="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 transition-colors"
            title="Print"
          >
            <Icon name="lucide:printer" class="w-4 h-4" />
          </NuxtLink>
        </div>

      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import { settingsDB }      from '~/services/db'
import { useAuth }         from '~/composables/useAuth'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Dashboard — Admin' })

const sessionStore = useSessionStore()
const auth         = useAuth()

const isResetting     = ref(false)
const remoteFeedback  = ref('')
const activeEventName = ref('')

const devices = [
  { label: 'Kamera',   icon: 'lucide:camera',   status: 'Aktif', detail: 'Siap mengambil foto' },
  { label: 'Printer',  icon: 'lucide:printer',  status: 'Siap',  detail: 'Siap print' },
  { label: 'Database', icon: 'lucide:database', status: 'Aktif', detail: 'Data tersimpan lokal' },
  { label: 'Layar Booth', icon: 'lucide:monitor', status: 'Online', detail: 'Terhubung ke booth' },
]

const todaySessions = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return sessionStore.history.filter(s => s.startedAt?.startsWith(today))
})

const totalShotsToday = computed(() => {
  return todaySessions.value.reduce((acc, s) => acc + (s.totalShots || 0), 0)
})

onMounted(async () => {
  await auth.loadPins()
  await sessionStore.loadHistory()

  activeEventName.value = (await settingsDB.get<string>('activeEventName'))
    || (typeof localStorage !== 'undefined' ? localStorage.getItem('photobooth_event_name') : '') || ''
})

async function remoteResetTablet() {
  isResetting.value = true
  remoteFeedback.value = ''
  try {
    await $fetch('/api/kiosk/command', { method: 'POST', body: { action: 'reset_home' } })
    remoteFeedback.value = '✓ Berhasil'
    setTimeout(() => { remoteFeedback.value = '' }, 2500)
  } catch {
    remoteFeedback.value = '✕ Gagal'
    setTimeout(() => { remoteFeedback.value = '' }, 2500)
  } finally {
    isResetting.value = false
  }
}

function formatDate(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
</script>
