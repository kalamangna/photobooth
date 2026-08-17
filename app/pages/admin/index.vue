<template>
  <div class="max-w-5xl mx-auto flex flex-col gap-8 pb-12 select-none text-zinc-100">

    <!-- ── Header & Live Status ──────────────────────────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-800/80 pb-6">
      <div class="flex flex-col gap-1">
        <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">Panel Operator</h1>
        <p class="text-xs text-zinc-500">Pengaturan dan kontrol kiosk.</p>
      </div>

      <!-- Stat -->
      <div class="text-right shrink-0">
        <span class="text-3xl font-black font-mono text-zinc-100">{{ todayCount }}</span>
        <p class="text-[11px] text-zinc-500 font-mono">sesi hari ini</p>
      </div>
    </div>

    <!-- ── Remote Kiosk Control & Quick Actions ───────────────────── -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-4">

      <!-- Reset Kiosk -->
      <div class="md:col-span-1 p-5 sm:p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between gap-4">
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">Kontrol Kiosk</span>
            <span v-if="remoteFeedback" class="text-xs font-semibold text-emerald-400">{{ remoteFeedback }}</span>
          </div>
          <h2 class="text-base font-bold text-zinc-100">Reset Tablet</h2>
          <p class="text-xs text-zinc-500 leading-relaxed">
            Kembalikan layar ke beranda untuk sesi berikutnya.
          </p>
        </div>

        <button
          id="btn-remote-reset"
          class="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all duration-150 active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-40 shadow-[0_4px_16px_rgba(245,158,11,0.15)]"
          :disabled="isResetting"
          @click="remoteResetTablet"
        >
          <Icon name="lucide:refresh-cw" class="w-4 h-4" :class="isResetting ? 'animate-spin' : ''" />
          <span>{{ isResetting ? 'Mengirim…' : 'Reset ke Beranda' }}</span>
        </button>
      </div>

      <!-- Quick Navigation: Galeri Foto -->
      <NuxtLink
        to="/gallery"
        class="group p-5 sm:p-6 rounded-3xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 flex flex-col justify-between gap-4 transition-all shadow-sm active:scale-[0.99]"
      >
        <div class="flex flex-col gap-2">
          <div class="w-10 h-10 rounded-2xl bg-zinc-800 group-hover:bg-amber-500/10 border border-zinc-700/60 group-hover:border-amber-500/30 flex items-center justify-center text-amber-400 transition-colors">
            <Icon name="lucide:image" class="w-5 h-5" />
          </div>
          <h2 class="text-lg font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">Galeri Sesi</h2>
          <p class="text-xs text-zinc-400 leading-relaxed">
            Lihat riwayat foto, unduh softfile, dan kirim perintah cetak ulang.
          </p>
        </div>

        <div class="flex items-center gap-1.5 text-xs font-bold text-amber-400 pt-2">
          <span>Buka Galeri ({{ sessionStore.history.length }})</span>
          <Icon name="lucide:arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </NuxtLink>

      <!-- Quick Navigation: Template Manager -->
      <NuxtLink
        to="/admin/templates"
        class="group p-5 sm:p-6 rounded-3xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 flex flex-col justify-between gap-4 transition-all shadow-sm active:scale-[0.99]"
      >
        <div class="flex flex-col gap-2">
          <div class="w-10 h-10 rounded-2xl bg-zinc-800 group-hover:bg-amber-500/10 border border-zinc-700/60 group-hover:border-amber-500/30 flex items-center justify-center text-amber-400 transition-colors">
            <Icon name="lucide:layout" class="w-5 h-5" />
          </div>
          <h2 class="text-lg font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">Template Manager</h2>
          <p class="text-xs text-zinc-400 leading-relaxed">
            Kelola desain bingkai strip 2×6, grid 4×6, dan template kustom.
          </p>
        </div>

        <div class="flex items-center gap-1.5 text-xs font-bold text-amber-400 pt-2">
          <span>Kelola Template</span>
          <Icon name="lucide:arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </NuxtLink>

    </section>

    <!-- ── Event & Booth Configuration Form ──────────────────────── -->
    <section class="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
      <div class="flex flex-col gap-1 border-b border-zinc-800/80 pb-4">
        <h2 class="text-lg font-bold text-zinc-100">Pengaturan Acara & Stan</h2>
        <p class="text-xs text-zinc-400">
          Perubahan otomatis disinkronkan langsung ke layar tablet booth.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">

        <!-- Event Name -->
        <div class="flex flex-col gap-2 md:col-span-2">
          <label class="text-xs font-bold text-zinc-200" for="setting-event-name">
            Nama Acara
          </label>
          <input
            id="setting-event-name"
            v-model="eventName"
            type="text"
            class="w-full px-4 py-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 text-sm sm:text-base outline-none transition-colors"
            placeholder="cth. Wedding of Sarah & Dimas"
            maxlength="60"
          />
          <span class="text-[11px] text-zinc-400">
            Ditampilkan di layar utama tablet dan metadata foto.
          </span>
        </div>

        <!-- Countdown Selector -->
        <div class="flex flex-col gap-2">
          <label class="text-xs font-bold text-zinc-200">
            Hitung Mundur
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="cd in [3, 5]"
              :key="cd"
              type="button"
              class="py-3 rounded-xl border text-xs sm:text-sm font-bold transition-all active:scale-95"
              :class="countdown === cd
                ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-sm'
                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'"
              @click="countdown = cd"
            >
              {{ cd }} Detik
            </button>
          </div>
        </div>

        <!-- Default Total Shots -->
        <div class="flex flex-col gap-2">
          <label class="text-xs font-bold text-zinc-200">
            Jumlah Foto Default
          </label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="s in [1, 2, 3, 4]"
              :key="s"
              type="button"
              class="py-3 rounded-xl border text-xs sm:text-sm font-bold transition-all active:scale-95"
              :class="defaultShots === s
                ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-sm'
                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'"
              @click="defaultShots = s"
            >
              {{ s }} Foto
            </button>
          </div>
        </div>

        <!-- Admin PIN -->
        <div class="flex flex-col gap-2 md:col-span-2">
          <label class="text-xs font-bold text-zinc-200" for="setting-pin">
            PIN Operator
          </label>
          <div class="relative max-w-xs">
            <Icon name="lucide:lock" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              id="setting-pin"
              v-model="adminPin"
              type="password"
              inputmode="numeric"
              maxlength="6"
              class="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 font-mono text-sm outline-none transition-colors"
              placeholder="123456"
            />
          </div>
          <span class="text-[11px] text-zinc-400">PIN 6 digit untuk membuka panel operator.</span>
        </div>

      </div>

      <!-- Save Button Footer -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800/80">
        <span v-if="saveFeedback" class="text-xs sm:text-sm font-bold text-emerald-400">
          {{ saveFeedback }}
        </span>
        <span v-else />

        <button
          id="btn-save-settings"
          class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/20 transition-all active:scale-95 min-h-[48px] disabled:opacity-50"
          :disabled="isSaving"
          @click="saveSettings"
        >
          {{ isSaving ? 'Menyimpan…' : 'Simpan Pengaturan' }}
        </button>
      </div>
    </section>

    <!-- ── Live Recent Sessions Feed ─────────────────────────────── -->
    <section class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h2 class="text-sm font-mono uppercase tracking-widest text-amber-500 font-bold">Sesi Foto Terbaru</h2>
          <span class="text-xs text-zinc-400">({{ sessionStore.history.length }} Total)</span>
        </div>

        <NuxtLink to="/gallery" class="text-xs font-bold text-zinc-400 hover:text-amber-400 transition-colors">
          Lihat Semua di Galeri →
        </NuxtLink>
      </div>

      <div v-if="sessionStore.history.length === 0" class="p-8 text-center bg-zinc-900/50 rounded-3xl border border-zinc-800 text-zinc-400 text-xs sm:text-sm">
        Belum ada sesi foto hari ini.
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <div
          v-for="session in sessionStore.history.slice(0, 6)"
          :key="session.id"
          class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3 shadow-sm hover:border-zinc-700 transition-colors"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
              <img
                v-if="session.outputUrl"
                :src="session.outputUrl"
                class="w-full h-full object-cover"
                alt=""
              />
              <Icon v-else name="lucide:image" class="w-5 h-5 text-zinc-600" />
            </div>

            <div class="flex flex-col min-w-0">
              <span class="font-mono text-xs font-bold text-zinc-200 truncate">
                {{ session.customerName || session.id }}
              </span>
              <span class="text-[10px] text-amber-400 font-medium truncate">
                {{ session.eventName || 'RD Photobooth' }}
              </span>
              <span class="text-[10px] text-zinc-400">
                {{ formatDate(session.startedAt) }} · {{ session.totalShots }} Foto
              </span>
            </div>
          </div>

          <NuxtLink
            to="/gallery"
            class="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 transition-colors shrink-0"
            title="Buka di Galeri"
          >
            <Icon name="lucide:printer" class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ── Danger Zone ──────────────────────────────────────────── -->
    <section class="p-6 rounded-3xl bg-zinc-950 border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <span class="font-mono text-xs font-bold uppercase tracking-wider text-rose-400">Pembersihan Data</span>
        <p class="text-xs text-zinc-400">
          Hapus riwayat sesi hari ini dari database lokal dan server.
        </p>
      </div>

      <button
        class="py-2.5 px-5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all active:scale-95 shrink-0"
        @click="confirmClearToday"
      >
        Hapus Sesi Hari Ini
      </button>
    </section>

  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import { settingsDB }      from '~/services/db'

definePageMeta({ layout: 'admin' })

useSeoMeta({
  title: 'RD Photobooth — Panel Operator',
  description: 'Panel kontrol operator photobooth.',
})

const sessionStore = useSessionStore()

// Settings State
const eventName      = ref('')
const adminPin       = ref('123456')
const countdown      = ref(5)
const defaultShots   = ref(3)
const isSaving       = ref(false)
const saveFeedback   = ref('')
const isResetting    = ref(false)
const remoteFeedback = ref('')

const todayCount = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return sessionStore.history.filter(s => s.startedAt && s.startedAt.startsWith(today)).length
})

onMounted(async () => {
  await sessionStore.loadHistory()

  // Load saved settings
  const savedEvent = (await settingsDB.get<string>('activeEventName')) || (typeof localStorage !== 'undefined' ? localStorage.getItem('photobooth_event_name') : null)
  const savedPin   = await settingsDB.get<string>('adminPin')
  const savedCd    = await settingsDB.get<number>('activeCountdown')
  const savedShots = await settingsDB.get<number>('lastTotalShots')

  if (savedEvent) eventName.value = savedEvent
  if (savedPin)   adminPin.value = savedPin
  if (savedCd)    countdown.value = savedCd
  if (savedShots) defaultShots.value = savedShots
})

async function remoteResetTablet() {
  isResetting.value = true
  remoteFeedback.value = ''
  try {
    await $fetch('/api/kiosk/command', {
      method: 'POST',
      body: { action: 'reset_home' },
    })
    remoteFeedback.value = '✓ Layar tablet direset ke beranda'
    setTimeout(() => { remoteFeedback.value = '' }, 3500)
  } catch {
    remoteFeedback.value = '✕ Gagal mengirim sinyal reset'
    setTimeout(() => { remoteFeedback.value = '' }, 3500)
  } finally {
    isResetting.value = false
  }
}

async function saveSettings() {
  isSaving.value = true
  saveFeedback.value = ''

  try {
    const trimmed = eventName.value.trim()
    await settingsDB.set('activeEventName', trimmed)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('photobooth_event_name', trimmed)
    }

    if (adminPin.value.trim().length === 6) {
      await settingsDB.set('adminPin', adminPin.value.trim())
    }

    await settingsDB.set('activeCountdown', countdown.value)
    await settingsDB.set('lastTotalShots', defaultShots.value)

    saveFeedback.value = '✓ Pengaturan berhasil disimpan!'
    setTimeout(() => { saveFeedback.value = '' }, 3500)
  } finally {
    isSaving.value = false
  }
}

async function confirmClearToday() {
  if (confirm(`Hapus seluruh sesi foto hari ini (${todayCount.value} sesi)? Tindakan ini tidak dapat dibatalkan.`)) {
    await sessionStore.clearTodaySessions()
    alert('Seluruh sesi hari ini berhasil dihapus.')
  }
}

function formatDate(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('id-ID', {
    hour:   '2-digit',
    minute: '2-digit',
  })
}
</script>
