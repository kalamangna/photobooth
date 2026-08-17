<template>
  <div class="max-w-7xl mx-auto flex flex-col gap-6 pb-12 select-none text-zinc-100">

    <!-- ── Page Header & Filter Bar ─────────────────────────────── -->
    <div class="flex flex-col gap-4 border-b border-zinc-800 pb-5">

      <!-- Top Title Row -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">Galeri Sesi</h1>
      </div>

      <!-- Controls Row: Filter, Search, & Date Tabs -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
        
        <!-- Left: Search & Event Dropdown -->
        <div class="flex flex-col sm:flex-row items-center gap-2.5 flex-1 min-w-0">
          <!-- Search Input -->
          <div class="relative w-full sm:flex-1">
            <Icon name="lucide:search" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari ID sesi, acara, atau email…"
              class="w-full pl-10 pr-8 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 outline-none focus:border-amber-500 transition-colors min-h-[40px]"
            />
            <button
              v-if="searchQuery"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
              @click="searchQuery = ''"
            >
              ✕
            </button>
          </div>

          <!-- Event Filter Dropdown -->
          <div class="relative w-full sm:w-60 shrink-0">
            <Icon name="lucide:party-popper" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 pointer-events-none" />
            <select
              v-model="selectedEvent"
              class="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm font-medium text-zinc-200 outline-none focus:border-amber-500 transition-colors cursor-pointer min-h-[40px]"
            >
              <option value="all">Semua Acara ({{ sessionStore.history.length }})</option>
              <option
                v-for="ev in availableEvents"
                :key="ev"
                :value="ev"
              >
                {{ ev }} ({{ getEventSessionCount(ev) }})
              </option>
            </select>
            <Icon name="lucide:chevron-down" class="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        <!-- Right: Date Tabs -->
        <div class="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 shrink-0 overflow-x-auto">
          <button
            v-for="tab in filterTabs"
            :key="tab.key"
            class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 whitespace-nowrap min-h-[32px]"
            :class="activeFilter === tab.key
              ? 'bg-amber-500 text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'"
            @click="activeFilter = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

      </div>
    </div>

    <!-- ── Photo Grid & States ──────────────────────────────────── -->
    <div v-if="sessionStore.isLoading" class="flex flex-col items-center justify-center h-64 gap-3 text-zinc-400 text-sm">
      <div class="w-8 h-8 border-4 border-zinc-700 border-t-amber-400 rounded-full animate-spin" />
      <p class="text-xs">Memuat sesi foto…</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredSessions.length === 0" class="flex flex-col items-center justify-center py-24 text-center gap-3 bg-zinc-900/40 rounded-3xl border border-zinc-800/80">
      <div class="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-500">
        <Icon name="lucide:image" class="w-7 h-7" />
      </div>
      <h2 class="text-base font-bold text-zinc-200">Belum Ada Sesi Foto</h2>
      <p class="text-xs text-zinc-400 max-w-sm">
        {{ searchQuery ? 'Tidak ada sesi foto yang sesuai dengan pencarian.' : 'Belum ada sesi foto yang tersimpan.' }}
      </p>
    </div>

    <!-- Grid Cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
      <div
        v-for="session in filteredSessions"
        :key="session.id"
        class="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl overflow-hidden cursor-pointer flex flex-col transition-all duration-150 active:scale-[0.98] shadow-lg hover:shadow-xl"
        @click="openDetail(session)"
      >
        <!-- Thumbnail Container -->
        <div class="aspect-[3/4] bg-zinc-950 relative overflow-hidden flex items-center justify-center p-2">
          <img
            v-if="session.outputUrl"
            :src="session.outputUrl"
            :alt="session.id"
            class="w-full h-full object-contain rounded-xl transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
          <div v-else-if="session.photos && session.photos[0]?.dataUrl" class="grid grid-cols-2 gap-1 w-full h-full p-2">
            <img
              v-for="(p, idx) in session.photos.slice(0, 4)"
              :key="idx"
              :src="p.dataUrl || ''"
              class="w-full h-full object-cover rounded-lg"
              alt=""
            />
          </div>
          <div v-else class="font-mono text-xs text-zinc-600">
            NO PREVIEW
          </div>

          <!-- Badges -->
          <div class="absolute top-3 left-3 flex items-center gap-1.5">
            <span class="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-black/80 text-zinc-200 border border-zinc-700 backdrop-blur-sm">
              {{ session.totalShots }} Foto
            </span>
          </div>

          <div class="absolute top-3 right-3">
            <span class="font-mono text-[10px] text-zinc-400 bg-black/70 px-2 py-0.5 rounded-md border border-zinc-800">
              {{ formatTime(session.startedAt) }}
            </span>
          </div>
        </div>

        <!-- Meta Footer & Quick Action Buttons -->
        <div class="p-3.5 bg-zinc-900 border-t border-zinc-800/80 flex flex-col gap-3">
          <div class="flex flex-col min-w-0">
            <span class="font-mono text-sm font-semibold text-zinc-100 truncate">
              {{ session.id }}
            </span>
            <div class="flex items-center justify-between gap-2 mt-0.5">
              <span class="text-xs text-amber-400 font-medium truncate">
                {{ getSessionEvent(session) }}
              </span>
              <span class="text-[10px] text-zinc-400 shrink-0">
                {{ formatTime(session.startedAt) }}
              </span>
            </div>
            <span v-if="session.customerEmail" class="text-[11px] text-zinc-400 truncate mt-0.5 flex items-center gap-1">
              <Icon name="lucide:mail" class="w-3 h-3 text-zinc-500 shrink-0" />
              <span>{{ session.customerEmail }}</span>
            </span>
          </div>

          <!-- Card Button Group -->
          <div class="flex items-center gap-2 pt-2 border-t border-zinc-800/60" @click.stop>
            <button
              class="flex-1 py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm disabled:opacity-30 disabled:pointer-events-none min-h-[34px]"
              title="Print"
              :disabled="!session.outputUrl"
              @click="quickReprint(session)"
            >
              <Icon name="lucide:printer" class="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              class="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none shrink-0"
              title="Download"
              :disabled="!session.outputUrl"
              @click="downloadOutput(session)"
            >
              <Icon name="lucide:download" class="w-3.5 h-3.5" />
            </button>
            <button
              class="w-8 h-8 rounded-xl bg-zinc-800/70 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 flex items-center justify-center transition-colors shrink-0"
              title="Hapus"
              @click="confirmDelete(session)"
            >
              <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Photo Detail & Reprint Modal ────────────────────────── -->
    <Transition
      enter-active-class="transition-opacity duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="activeSession"
        class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-8"
        @click.self="closeDetail"
      >
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          
          <!-- Modal Top Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0 bg-zinc-900/80">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Icon name="lucide:camera" class="w-4.5 h-4.5" />
              </div>
              <div class="flex items-center gap-2.5">
                <span class="font-mono text-base font-bold text-zinc-100">{{ activeSession.id }}</span>
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium">
                  {{ getSessionEvent(activeSession) }}
                </span>
              </div>
            </div>
            <button
              class="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              @click="closeDetail"
            >
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>

          <!-- Modal Body (2 Columns on md+) -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 overflow-y-auto items-start">
            
            <!-- Left Column: Photo Preview (7 cols) -->
            <div class="md:col-span-7 flex flex-col">
              <div class="aspect-[3/4] max-h-[480px] bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden flex items-center justify-center p-3">
                <img
                  v-if="selectedPreviewUrl"
                  :src="selectedPreviewUrl"
                  alt="Preview"
                  class="w-full h-full object-contain rounded-xl shadow-lg"
                />
                <div v-else class="text-zinc-600 font-mono text-xs">TIDAK ADA FOTO</div>
              </div>
            </div>

            <!-- Right Column: Info & Operational Actions (5 cols) -->
            <div class="md:col-span-5 flex flex-col gap-4">
              
              <!-- Session Info List -->
              <div class="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-zinc-500">Waktu Sesi</span>
                  <span class="text-zinc-200 font-medium">{{ formatDateTime(activeSession.startedAt) }}</span>
                </div>
                <div class="flex items-center justify-between text-xs border-t border-zinc-800/60 pt-2.5">
                  <span class="text-zinc-500">Acara</span>
                  <span class="text-amber-400 font-semibold">{{ getSessionEvent(activeSession) }}</span>
                </div>
                <div class="flex items-center justify-between text-xs border-t border-zinc-800/60 pt-2.5">
                  <span class="text-zinc-500">Jumlah Foto</span>
                  <span class="font-mono text-zinc-200">{{ activeSession.totalShots }} foto</span>
                </div>
                <div v-if="activeSession.customerEmail" class="flex items-center justify-between text-xs border-t border-zinc-800/60 pt-2.5">
                  <span class="text-zinc-500">Email</span>
                  <span class="text-zinc-200 truncate max-w-[180px]">{{ activeSession.customerEmail }}</span>
                </div>
              </div>

              <!-- Print Action (Direct 1 Lembar) -->
              <div class="flex flex-col gap-2">
                <button
                  class="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-40"
                  :disabled="isReprinting || !activeSession.outputUrl"
                  @click="triggerReprint"
                >
                  <Icon v-if="isReprinting" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                  <Icon v-else name="lucide:printer" class="w-4 h-4" />
                  <span>{{ isReprinting ? 'Mengirim ke Printer…' : 'Print' }}</span>
                </button>

                <p v-if="reprintFeedback" class="text-xs font-semibold text-emerald-400 text-center">
                  {{ reprintFeedback }}
                </p>
              </div>

              <!-- Secondary Action Buttons -->
              <div class="grid grid-cols-2 gap-3 pt-1">
                <button
                  class="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 border border-zinc-700/60"
                  @click="downloadOutput(activeSession)"
                >
                  <Icon name="lucide:download" class="w-4 h-4" />
                  <span>Download</span>
                </button>

                <button
                  class="py-3 px-4 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                  @click="confirmDelete(activeSession)"
                >
                  <Icon name="lucide:trash-2" class="w-4 h-4" />
                  <span>Hapus</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>
    </Transition>

    <!-- ── Delete Confirmation Dialog ──────────────────────────── -->
    <Transition
      enter-active-class="transition-opacity duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sessionToDelete"
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="sessionToDelete = null"
      >
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-2xl">
          <div class="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Icon name="lucide:alert-triangle" class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-zinc-100">Hapus Sesi?</h3>
            <p class="text-xs text-zinc-400 mt-1">
              Sesi <span class="font-mono text-zinc-300 font-bold">{{ sessionToDelete.id }}</span> akan dihapus permanen.
            </p>
          </div>
          <div class="flex items-center gap-2 pt-2">
            <button
              class="flex-1 py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all active:scale-95"
              @click="sessionToDelete = null"
            >
              Batal
            </button>
            <button
              class="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 text-xs font-bold transition-all active:scale-95 shadow-md shadow-rose-500/20"
              @click="executeDelete"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import type { Session }    from '~/types/session'

definePageMeta({ layout: 'admin' })

useSeoMeta({
  title: 'RD Photobooth — Galeri Sesi',
  description: 'Galeri dan riwayat foto photobooth.',
})

const sessionStore = useSessionStore()

const searchQuery        = ref('')
const selectedEvent      = ref('all')
const activeFilter       = ref<'all' | 'today' | 'yesterday' | 'week'>('all')
const activeSession      = ref<Session | null>(null)
const selectedPreviewUrl = ref<string | null>(null)
const sessionToDelete    = ref<Session | null>(null)
const reprintCopies      = ref(1)
const isReprinting       = ref(false)
const reprintFeedback    = ref('')

let pollTimer: ReturnType<typeof setInterval> | null = null

const filterTabs = [
  { key: 'all',       label: 'Semua' },
  { key: 'today',     label: 'Hari Ini' },
  { key: 'yesterday', label: 'Kemarin' },
  { key: 'week',      label: '7 Hari Terakhir' },
] as const

const availableEvents = computed(() => {
  const set = new Set<string>()
  sessionStore.history.forEach(s => {
    const ev = getSessionEvent(s)
    if (ev) set.add(ev)
  })
  return Array.from(set)
})

function getSessionEvent(session: Session): string {
  return session.eventName || (session as any).event_name || 'RD Photobooth'
}

function getEventSessionCount(eventName: string): number {
  return sessionStore.history.filter(s => getSessionEvent(s) === eventName).length
}

onMounted(async () => {
  await sessionStore.loadHistory()

  // Auto-refresh gallery sessions from server every 3.5s silently in background
  pollTimer = setInterval(async () => {
    await sessionStore.loadHistory(true)
  }, 3500)
})

onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
})

// ─── Filtered Sessions ─────────────────────────────────────────
const filteredSessions = computed(() => {
  let list = sessionStore.history

  // Filter by event
  if (selectedEvent.value !== 'all') {
    list = list.filter(s => getSessionEvent(s) === selectedEvent.value)
  }

  // Filter by date
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)

  const yest = new Date(now)
  yest.setDate(yest.getDate() - 1)
  const yestStr = yest.toISOString().slice(0, 10)

  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)

  if (activeFilter.value === 'today') {
    list = list.filter(s => s.startedAt.startsWith(todayStr))
  } else if (activeFilter.value === 'yesterday') {
    list = list.filter(s => s.startedAt.startsWith(yestStr))
  } else if (activeFilter.value === 'week') {
    list = list.filter(s => new Date(s.startedAt) >= weekAgo)
  }

  // Filter by search
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(s =>
      s.id.toLowerCase().includes(q) ||
      getSessionEvent(s).toLowerCase().includes(q) ||
      (s.customerEmail && s.customerEmail.toLowerCase().includes(q))
    )
  }

  return list
})

// ─── Detail Modal ──────────────────────────────────────────────
function openDetail(session: Session) {
  activeSession.value = session
  selectedPreviewUrl.value = session.outputUrl || session.photos?.[0]?.dataUrl || null
  reprintCopies.value = 1
  reprintFeedback.value = ''
}

function closeDetail() {
  activeSession.value = null
  selectedPreviewUrl.value = null
  reprintFeedback.value = ''
}

// ─── Download ──────────────────────────────────────────────────
function downloadOutput(session: Session) {
  const url = selectedPreviewUrl.value || session.outputUrl
  if (!url) return
  const a = document.createElement('a')
  a.href = url
  a.download = `${session.id}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// ─── Reprint ───────────────────────────────────────────────────
async function triggerReprint() {
  if (!activeSession.value) return
  isReprinting.value = true
  reprintFeedback.value = ''

  try {
    const job = await sessionStore.reprintSession(activeSession.value.id, 1)
    if (job) {
      reprintFeedback.value = '✓ Foto berhasil dikirim ke antrean printer'
      setTimeout(() => {
        if (reprintFeedback.value.startsWith('✓')) reprintFeedback.value = ''
      }, 4000)
    }
  } finally {
    isReprinting.value = false
  }
}

async function quickReprint(session: Session) {
  const job = await sessionStore.reprintSession(session.id, 1)
  if (job) {
    alert(`Foto sesi ${session.id} berhasil dikirim ke printer.`)
  }
}

// ─── Delete ────────────────────────────────────────────────────
function confirmDelete(session: Session) {
  sessionToDelete.value = session
}

async function executeDelete() {
  if (!sessionToDelete.value) return
  const id = sessionToDelete.value.id

  if (activeSession.value?.id === id) {
    closeDetail()
  }

  await sessionStore.deleteSession(id)
  sessionToDelete.value = null
}

// ─── Formatting helpers ────────────────────────────────────────
function formatTime(isoStr: string): string {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function formatDateTime(isoStr: string): string {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
