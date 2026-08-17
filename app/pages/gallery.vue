<template>
  <div class="max-w-7xl mx-auto flex flex-col gap-6 pb-12 select-none text-zinc-100">

    <!-- ── Page Header & Filter Bar ─────────────────────────────── -->
    <div class="flex flex-col gap-4 border-b border-zinc-800/80 pb-6">
      
      <!-- Top Title Row -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex flex-col gap-0.5">
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-black tracking-tight text-zinc-100">Galeri Sesi Foto</h1>
            <span class="font-mono text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
              {{ filteredSessions.length }} Sesi
            </span>
          </div>
          <p class="text-xs text-zinc-400">
            Arsip softfile foto tamu dan cetak ulang lembaran foto.
          </p>
        </div>
      </div>

      <!-- Controls Row: Filter, Search, & Date Tabs -->
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1">
        
        <!-- Event Filter Dropdown (4 cols) -->
        <div class="sm:col-span-4 relative">
          <Icon name="lucide:party-popper" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 pointer-events-none" />
          <select
            v-model="selectedEvent"
            class="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-200 outline-none focus:border-amber-500 transition-colors cursor-pointer min-h-[42px]"
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

        <!-- Search Input (4 cols) -->
        <div class="sm:col-span-4 relative">
          <Icon name="lucide:search" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari ID / Nama Tamu / Acara…"
            class="w-full pl-10 pr-8 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 outline-none focus:border-amber-500 transition-colors min-h-[42px]"
          />
          <button
            v-if="searchQuery"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
            @click="searchQuery = ''"
          >
            ✕
          </button>
        </div>

        <!-- Date Tabs (4 cols) -->
        <div class="sm:col-span-4 flex items-center justify-end">
          <div class="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 w-full sm:w-auto">
            <button
              v-for="tab in filterTabs"
              :key="tab.key"
              class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 whitespace-nowrap min-h-[32px]"
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
    </div>

    <!-- ── Photo Grid & States ──────────────────────────────────── -->
    <div v-if="sessionStore.isLoading" class="flex flex-col items-center justify-center h-64 gap-3 text-zinc-400 text-sm">
      <div class="w-8 h-8 border-4 border-zinc-700 border-t-amber-400 rounded-full animate-spin" />
      <p class="text-xs">Memuat galeri foto…</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredSessions.length === 0" class="flex flex-col items-center justify-center py-24 text-center gap-3 bg-zinc-900/40 rounded-3xl border border-zinc-800/80">
      <div class="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-500">
        <Icon name="lucide:image" class="w-7 h-7" />
      </div>
      <h2 class="text-base font-bold text-zinc-200">Belum Ada Sesi Foto</h2>
      <p class="text-xs text-zinc-400 max-w-sm">
        {{ searchQuery ? 'Tidak ada hasil foto yang cocok dengan pencarian Anda.' : 'Foto yang diambil di stan photobooth akan otomatis muncul di sini.' }}
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
        <div class="p-4 bg-zinc-900 border-t border-zinc-800/80 flex items-center justify-between gap-2">
          <div class="flex flex-col min-w-0">
            <span class="font-mono text-xs font-bold text-zinc-100 truncate">
              {{ session.customerName || session.id }}
            </span>
            <span class="text-[11px] text-amber-400 font-medium truncate">
              {{ getSessionEvent(session) }}
            </span>
            <span v-if="session.customerEmail" class="text-[10px] text-zinc-400 truncate">
              {{ session.customerEmail }}
            </span>
          </div>

          <div class="flex items-center gap-1 shrink-0" @click.stop>
            <button
              class="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-zinc-100 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              title="Unduh Softfile HD"
              :disabled="!session.outputUrl"
              @click="downloadOutput(session)"
            >
              <Icon name="lucide:download" class="w-4 h-4" />
            </button>
            <button
              class="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-amber-400 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              title="Cetak Ulang"
              :disabled="!session.outputUrl"
              @click="quickReprint(session)"
            >
              <Icon name="lucide:printer" class="w-4 h-4" />
            </button>
            <button
              class="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
              title="Hapus Sesi"
              @click="confirmDelete(session)"
            >
              <Icon name="lucide:trash-2" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Photo Detail & Reprint Modal ────────────────────────── -->
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="activeSession"
        class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
        @click.self="closeDetail"
      >
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full flex flex-col gap-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          
          <!-- Modal Header -->
          <div class="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Icon name="lucide:camera" class="w-5 h-5" />
              </div>
              <div>
                <h2 class="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <span class="font-mono">{{ activeSession.customerName || activeSession.id }}</span>
                </h2>
                <p class="text-xs text-zinc-400">
                  {{ formatDateTime(activeSession.startedAt) }} · {{ getSessionEvent(activeSession) }}
                </p>
              </div>
            </div>
            <button
              class="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              @click="closeDetail"
            >
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>

          <!-- Modal Body: Image & Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            <!-- Left: Main Preview -->
            <div class="flex flex-col gap-3">
              <div class="aspect-[3/4] max-h-[420px] bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden flex items-center justify-center p-3">
                <img
                  v-if="selectedPreviewUrl"
                  :src="selectedPreviewUrl"
                  alt="Preview"
                  class="w-full h-full object-contain rounded-xl shadow-lg"
                />
                <div v-else class="text-zinc-600 font-mono text-xs">PILIH FOTO</div>
              </div>

              <!-- Thumbnails selector -->
              <div class="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  v-if="activeSession.outputUrl"
                  class="flex flex-col items-center gap-1 p-1 rounded-xl border transition-all shrink-0"
                  :class="selectedPreviewUrl === activeSession.outputUrl
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-zinc-800 bg-zinc-950/50'"
                  @click="selectedPreviewUrl = activeSession.outputUrl"
                >
                  <img :src="activeSession.outputUrl" class="w-14 h-14 object-cover rounded-lg" alt="Output" />
                  <span class="text-[9px] font-mono text-amber-400 font-bold">HASIL</span>
                </button>
                <button
                  v-for="(photo, i) in activeSession.photos"
                  :key="i"
                  class="flex flex-col items-center gap-1 p-1 rounded-xl border transition-all shrink-0"
                  :class="selectedPreviewUrl === photo.dataUrl
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-zinc-800 bg-zinc-950/50'"
                  :disabled="!photo.dataUrl"
                  @click="photo.dataUrl && (selectedPreviewUrl = photo.dataUrl)"
                >
                  <img
                    v-if="photo.dataUrl"
                    :src="photo.dataUrl"
                    class="w-14 h-14 object-cover rounded-lg"
                    :alt="`Shot ${i + 1}`"
                  />
                  <span class="text-[9px] font-mono text-zinc-400">SHOT {{ i + 1 }}</span>
                </button>
              </div>
            </div>

            <!-- Right: Details & Actions -->
            <div class="flex flex-col gap-5 bg-zinc-950/60 p-5 rounded-2xl border border-zinc-800/80">
              
              <!-- Session Info List -->
              <div class="flex flex-col gap-2 text-xs">
                <div class="flex justify-between py-1 border-b border-zinc-850">
                  <span class="text-zinc-500">ID Sesi</span>
                  <span class="font-mono text-zinc-300">{{ activeSession.id }}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-zinc-850">
                  <span class="text-zinc-500">Nama Tamu</span>
                  <span class="font-bold text-zinc-200">{{ activeSession.customerName || '-' }}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-zinc-850">
                  <span class="text-zinc-500">Email Tamu</span>
                  <span class="text-zinc-300 truncate max-w-[180px]">{{ activeSession.customerEmail || '-' }}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-zinc-850">
                  <span class="text-zinc-500">Acara</span>
                  <span class="text-amber-400 font-bold">{{ getSessionEvent(activeSession) }}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-zinc-850">
                  <span class="text-zinc-500">Jumlah Foto</span>
                  <span class="font-mono text-zinc-300">{{ activeSession.totalShots }} foto</span>
                </div>
              </div>

              <!-- Download Button -->
              <button
                class="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                @click="downloadOutput(activeSession)"
              >
                <Icon name="lucide:download" class="w-4 h-4" />
                <span>Unduh Softfile</span>
              </button>

              <!-- Reprint Control Section -->
              <div class="flex flex-col gap-3 pt-3 border-t border-zinc-800">
                <label class="text-xs font-bold text-zinc-200 flex items-center justify-between">
                  <span>Cetak Ulang</span>
                  <span class="text-[10px] text-zinc-500 font-normal">Jumlah salinan</span>
                </label>

                <div class="flex items-center gap-3">
                  <div class="flex items-center border border-zinc-700 rounded-xl bg-zinc-900 overflow-hidden">
                    <button
                      class="px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 active:bg-zinc-700 text-sm font-bold transition-colors"
                      :disabled="reprintCopies <= 1"
                      @click="reprintCopies = Math.max(1, reprintCopies - 1)"
                    >
                      −
                    </button>
                    <span class="px-4 py-2 font-mono text-sm font-bold text-zinc-100 min-w-[36px] text-center">
                      {{ reprintCopies }}
                    </span>
                    <button
                      class="px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 active:bg-zinc-700 text-sm font-bold transition-colors"
                      :disabled="reprintCopies >= 10"
                      @click="reprintCopies = Math.min(10, reprintCopies + 1)"
                    >
                      +
                    </button>
                  </div>

                  <button
                    class="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 min-h-[42px] disabled:opacity-50"
                    :disabled="isReprinting || !activeSession.outputUrl"
                    @click="triggerReprint"
                  >
                    <Icon name="lucide:printer" class="w-4 h-4" />
                    <span>{{ isReprinting ? 'Mengirim…' : `Cetak ${reprintCopies} Lembar` }}</span>
                  </button>
                </div>

                <p v-if="reprintFeedback" class="text-xs font-bold text-emerald-400 mt-1">
                  {{ reprintFeedback }}
                </p>
              </div>

              <!-- Delete button -->
              <div class="pt-2 border-t border-zinc-850 flex justify-end">
                <button
                  class="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5"
                  @click="confirmDelete(activeSession)"
                >
                  <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
                  <span>Hapus Sesi Ini</span>
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
            <h3 class="text-base font-bold text-zinc-100">Hapus Sesi Foto?</h3>
            <p class="text-xs text-zinc-400 mt-1">
              Sesi <span class="font-mono text-zinc-300 font-bold">{{ sessionToDelete.id }}</span> akan dihapus permanen dari memori.
            </p>
          </div>
          <div class="flex items-center gap-2 pt-2">
            <button
              class="flex-1 py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all active:scale-95"
              @click="sessionToDelete = null"
            >
              Batal
            </button>
            <button
              class="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 text-xs font-black transition-all active:scale-95 shadow-md shadow-rose-500/20"
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
      (s.customerName && s.customerName.toLowerCase().includes(q)) ||
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
    const job = await sessionStore.reprintSession(activeSession.value.id, reprintCopies.value)
    if (job) {
      reprintFeedback.value = `✓ Job cetak #${job.id} ditambahkan ke antrean (${reprintCopies.value} lembar)`
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
    alert(`Cetak ulang sesi ${session.id} (1 lembar) berhasil dimasukkan ke antrean printer!`)
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
