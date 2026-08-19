<template>
  <div class="max-w-7xl mx-auto flex flex-col gap-6">

    <!-- ── Header & Filter Bar ───────────────────────────────── -->
    <div class="flex flex-col gap-4 border-b border-zinc-800 pb-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-zinc-100">Sesi Foto</h1>
          <p class="text-xs sm:text-sm text-zinc-400">Riwayat sesi pengambilan dan cetak foto</p>
        </div>

        <button
          type="button"
          @click="exportSessionsJSON"
          :disabled="sessionStore.history.length === 0"
          class="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-850 hover:bg-zinc-800 active:scale-95 text-zinc-200 text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <Icon name="lucide:download" class="w-4 h-4 text-amber-400" />
          <span>Ekspor JSON</span>
        </button>
      </div>

      <!-- Filters Row -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <!-- Search & Event filter -->
        <div class="flex flex-col sm:flex-row items-center gap-2.5 flex-1">
          <div class="relative w-full sm:w-80">
            <Icon name="lucide:search" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari ID sesi atau email…"
              class="w-full pl-10 pr-8 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 outline-none transition-colors"
            />
            <button
              v-if="searchQuery"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
              @click="searchQuery = ''"
            >
              ✕
            </button>
          </div>

          <select
            v-model="selectedEvent"
            class="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:border-amber-500 outline-none"
          >
            <option value="all">Semua Acara</option>
            <option v-for="ev in availableEvents" :key="ev" :value="ev">{{ ev }}</option>
          </select>
        </div>

        <!-- Date range tabs -->
        <div class="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl overflow-x-auto">
          <button
            v-for="tab in filterTabs"
            :key="tab.key"
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
            :class="activeFilter === tab.key
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-zinc-400 hover:text-zinc-200'"
            @click="activeFilter = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Empty State ───────────────────────────────────────── -->
    <div
      v-if="filteredSessions.length === 0"
      class="py-16 px-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center gap-3 shadow-sm"
    >
      <div class="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500">
        <Icon name="lucide:images" class="w-6 h-6" />
      </div>
      <div>
        <p class="text-base font-bold text-zinc-200">Tidak Ada Sesi Foto</p>
        <p class="text-xs text-zinc-400 mt-0.5">Tidak ditemukan data sesi foto yang sesuai dengan filter pencarian atau periode waktu.</p>
      </div>
    </div>

    <!-- ── Desktop Flowbite Table View (md and up) ────────────── -->
    <div v-else class="hidden md:block bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
      <table class="w-full text-left text-xs text-zinc-300">
        <thead class="bg-zinc-850/80 border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
          <tr>
            <th scope="col" class="px-5 py-3.5">Waktu</th>
            <th scope="col" class="px-5 py-3.5">Sesi & Email</th>
            <th scope="col" class="px-5 py-3.5">Acara</th>
            <th scope="col" class="px-5 py-3.5 text-center">Foto</th>
            <th scope="col" class="px-5 py-3.5 text-center">Status Cetak</th>
            <th scope="col" class="px-5 py-3.5 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-800/80 font-sans">
          <tr
            v-for="session in filteredSessions"
            :key="session.id"
            class="hover:bg-zinc-800/40 transition-colors"
          >
            <!-- Waktu -->
            <td class="px-5 py-4 whitespace-nowrap font-mono text-zinc-400">
              {{ formatDateTime(session.startedAt) }}
            </td>

            <!-- Sesi & Email -->
            <td class="px-5 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-12 bg-zinc-950 rounded-lg overflow-hidden shrink-0 border border-zinc-800 flex items-center justify-center">
                  <img
                    v-if="session.outputUrl"
                    :src="session.outputUrl"
                    class="w-full h-full object-cover"
                    alt="thumb"
                  />
                  <Icon v-else name="lucide:image" class="w-4 h-4 text-zinc-600" />
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="font-mono font-bold text-zinc-100 truncate">#{{ session.id }}</span>
                  <span class="font-sans text-[11px] text-zinc-400 truncate">{{ session.customerEmail || 'Tanpa email' }}</span>
                </div>
              </div>
            </td>

            <!-- Acara -->
            <td class="px-5 py-4 whitespace-nowrap text-zinc-300">
              {{ getSessionEvent(session) }}
            </td>

            <!-- Foto Count -->
            <td class="px-5 py-4 text-center whitespace-nowrap">
              <span class="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono font-bold text-[10px]">
                {{ session.totalShots }} FOTO
              </span>
            </td>

            <!-- Print Status -->
            <td class="px-5 py-4 text-center whitespace-nowrap">
              <span
                v-if="session.printedAt || session.printJobId"
                class="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              >
                Tercetak {{ session.printCount && session.printCount > 1 ? `(${session.printCount}x)` : '' }}
              </span>
              <span
                v-else-if="session.outputUrl"
                class="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border bg-amber-500/10 text-amber-400 border-amber-500/20"
              >
                Belum Dicetak
              </span>
              <span
                v-else
                class="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border bg-zinc-800 text-zinc-400 border-zinc-700"
              >
                Tanpa Foto
              </span>
            </td>

            <!-- Aksi Buttons -->
            <td class="px-5 py-4 text-right whitespace-nowrap">
              <div class="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  @click="openDetail(session)"
                  class="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                  title="Lihat Detail"
                >
                  <Icon name="lucide:eye" class="w-4 h-4" />
                </button>

                <button
                  type="button"
                  @click="quickReprint(session)"
                  :disabled="!session.outputUrl"
                  class="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors disabled:opacity-40"
                  title="Cetak Foto"
                >
                  <Icon name="lucide:printer" class="w-4 h-4" />
                </button>

                <button
                  type="button"
                  @click="downloadOutput(session)"
                  :disabled="!session.outputUrl"
                  class="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors disabled:opacity-40"
                  title="Download File"
                >
                  <Icon name="lucide:download" class="w-4 h-4" />
                </button>

                <button
                  v-if="auth.isAdmin.value"
                  type="button"
                  @click="confirmDelete(session)"
                  class="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                  title="Hapus Sesi"
                >
                  <Icon name="lucide:trash-2" class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Mobile Cards View (below md) ──────────────────────── -->
    <div v-if="filteredSessions.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
      <div
        v-for="session in filteredSessions"
        :key="session.id"
        class="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-3 shadow-md"
      >
        <div class="flex items-center gap-3">
          <div class="w-14 h-18 bg-zinc-950 rounded-xl overflow-hidden shrink-0 border border-zinc-800 flex items-center justify-center">
            <img
              v-if="session.outputUrl"
              :src="session.outputUrl"
              class="w-full h-full object-cover"
              alt="thumb"
            />
            <Icon v-else name="lucide:image" class="w-5 h-5 text-zinc-600" />
          </div>

          <div class="flex flex-col min-w-0 flex-1 gap-0.5">
            <div class="flex items-center justify-between">
              <span class="font-mono text-xs font-bold text-zinc-100">#{{ session.id }}</span>
              <span class="font-mono text-[10px] text-zinc-400">{{ formatTime(session.startedAt) }}</span>
            </div>
            <p class="text-xs text-zinc-400 truncate">{{ session.customerEmail || 'Tanpa email' }}</p>
            <div class="flex items-center justify-between gap-2 mt-0.5">
              <p class="text-[11px] text-zinc-500 truncate">{{ getSessionEvent(session) }}</p>
              <span
                v-if="session.printedAt || session.printJobId"
                class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shrink-0"
              >
                Tercetak {{ session.printCount && session.printCount > 1 ? `(${session.printCount}x)` : '' }}
              </span>
              <span
                v-else-if="session.outputUrl"
                class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border bg-amber-500/10 text-amber-400 border-amber-500/20 shrink-0"
              >
                Belum Cetak
              </span>
              <span
                v-else
                class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border bg-zinc-800 text-zinc-400 border-zinc-700 shrink-0"
              >
                Tanpa Foto
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2 border-t border-zinc-800">
          <button
            type="button"
            @click="openDetail(session)"
            class="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Icon name="lucide:eye" class="w-3.5 h-3.5" />
            <span>Detail</span>
          </button>

          <button
            type="button"
            @click="quickReprint(session)"
            :disabled="!session.outputUrl"
            class="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <Icon name="lucide:printer" class="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            v-if="auth.isAdmin.value"
            type="button"
            @click="confirmDelete(session)"
            class="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
          >
            <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- ── Detail Modal ──────────────────────────────────────── -->
    <div
      v-if="activeSession"
      class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm"
      @click.self="closeDetail"
    >
      <div class="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div class="flex items-center gap-2.5">
            <div class="p-2 bg-amber-500/10 rounded-xl text-amber-400">
              <Icon name="lucide:camera" class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-zinc-100">Detail Sesi Foto</h3>
              <p class="text-xs text-zinc-500 font-mono">#{{ activeSession.id }}</p>
            </div>
          </div>
          <button
            type="button"
            @click="closeDetail"
            class="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Content -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <!-- Preview Box -->
          <div class="aspect-[3/4] bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 flex items-center justify-center p-3">
            <img
              v-if="selectedPreviewUrl"
              :src="selectedPreviewUrl"
              class="w-full h-full object-contain rounded-xl shadow-md"
              alt="Detail Preview"
            />
            <span v-else class="text-xs text-zinc-500">Tidak ada preview</span>
          </div>

          <!-- Metadata & Actions -->
          <div class="flex flex-col justify-between gap-4">
            <div class="p-4 bg-zinc-850/80 border border-zinc-800 rounded-2xl flex flex-col gap-3 text-xs">
              <div class="flex justify-between border-b border-zinc-800 pb-2">
                <span class="text-zinc-400">ID Sesi:</span>
                <span class="font-mono font-bold text-zinc-100">#{{ activeSession.id }}</span>
              </div>
              <div class="flex justify-between border-b border-zinc-800 pb-2">
                <span class="text-zinc-400">Waktu:</span>
                <span class="font-mono text-zinc-300">{{ formatDateTime(activeSession.startedAt) }}</span>
              </div>
              <div class="flex justify-between border-b border-zinc-800 pb-2">
                <span class="text-zinc-400">Email:</span>
                <span class="text-zinc-300 font-mono truncate max-w-[170px]">{{ activeSession.customerEmail || 'Tidak diisi' }}</span>
              </div>
              <div class="flex justify-between border-b border-zinc-800 pb-2">
                <span class="text-zinc-400">Status Cetak:</span>
                <span
                  v-if="activeSession.printedAt || activeSession.printJobId"
                  class="font-semibold text-emerald-400"
                >
                  Tercetak {{ activeSession.printCount && activeSession.printCount > 1 ? `(${activeSession.printCount}x)` : '' }}
                </span>
                <span
                  v-else-if="activeSession.outputUrl"
                  class="font-semibold text-amber-400"
                >
                  Belum Dicetak
                </span>
                <span v-else class="text-zinc-500">
                  Tanpa Foto
                </span>
              </div>
              <div v-if="activeSession.cloudUrl" class="flex justify-between items-center pt-0.5">
                <span class="text-zinc-400">Cloud Link:</span>
                <a
                  :href="activeSession.cloudUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Icon name="lucide:external-link" class="w-3.5 h-3.5" />
                  <span>Buka Foto Cloud</span>
                </a>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-2.5 pt-1">
              <!-- Primary: Cetak Foto -->
              <button
                type="button"
                @click="triggerReprint"
                :disabled="isReprinting || !activeSession.outputUrl"
                class="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-zinc-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-40 disabled:pointer-events-none"
              >
                <Icon v-if="isReprinting" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                <Icon v-else name="lucide:printer" class="w-4 h-4" />
                <span>{{ isReprinting ? 'Mengirim ke printer…' : 'Cetak Foto' }}</span>
              </button>

              <div v-if="reprintFeedback" class="py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 text-center flex items-center justify-center gap-1.5">
                <Icon name="lucide:check-circle-2" class="w-3.5 h-3.5" />
                <span>{{ reprintFeedback }}</span>
              </div>

              <!-- Secondary Row -->
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="downloadOutput(activeSession)"
                  :disabled="!activeSession.outputUrl"
                  class="flex-1 py-2.5 px-3 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 active:scale-[0.98] text-zinc-200 text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <Icon name="lucide:download" class="w-4 h-4 text-zinc-400" />
                  <span>Unduh File</span>
                </button>

                <button
                  v-if="auth.isAdmin.value"
                  type="button"
                  @click="confirmDelete(activeSession)"
                  class="flex-1 py-2.5 px-3 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 active:scale-[0.98] text-rose-400 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Icon name="lucide:trash-2" class="w-4 h-4" />
                  <span>Hapus Sesi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Delete Confirmation Modal ─────────────────────────── -->
    <div
      v-if="sessionToDelete"
      class="fixed inset-0 z-60 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm"
      @click.self="sessionToDelete = null"
    >
      <div class="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
        <div class="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <Icon name="lucide:alert-triangle" class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-base font-bold text-zinc-100">Hapus Sesi?</h3>
          <p class="text-xs text-zinc-400 mt-1">
            Sesi <span class="font-mono font-bold text-zinc-200">#{{ sessionToDelete.id }}</span> akan dihapus permanen dari memori lokal.
          </p>
        </div>
        <div class="flex items-center gap-2 pt-2">
          <button
            type="button"
            @click="sessionToDelete = null"
            class="flex-1 py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            @click="executeDelete"
            class="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 text-xs font-bold transition-all"
          >
            Hapus Sesi
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import type { Session }    from '~/types/session'
import { useAuth }         from '~/composables/useAuth'
import { sessionPhotosDB } from '~/services/db'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Sesi Foto — RD Photobooth' })

const sessionStore = useSessionStore()
const auth         = useAuth()

const searchQuery        = ref('')
const selectedEvent      = ref('all')
const activeFilter       = ref<'all' | 'today' | 'yesterday' | 'week'>('all')
const activeSession      = ref<Session | null>(null)
const selectedPreviewUrl = ref<string | null>(null)
const sessionToDelete    = ref<Session | null>(null)
const isReprinting       = ref(false)
const reprintFeedback    = ref('')

let pollTimer: ReturnType<typeof setInterval> | null = null

const filterTabs = [
  { key: 'all',       label: 'Semua Waktu' },
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

onMounted(async () => {
  await sessionStore.loadHistory()
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

const filteredSessions = computed(() => {
  let list = sessionStore.history
  if (selectedEvent.value !== 'all') {
    list = list.filter(s => getSessionEvent(s) === selectedEvent.value)
  }
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const yest = new Date(now)
  yest.setDate(yest.getDate() - 1)
  const yestStr = yest.toISOString().slice(0, 10)
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)

  if (activeFilter.value === 'today') {
    list = list.filter(s => s.startedAt?.startsWith(todayStr))
  } else if (activeFilter.value === 'yesterday') {
    list = list.filter(s => s.startedAt?.startsWith(yestStr))
  } else if (activeFilter.value === 'week') {
    list = list.filter(s => new Date(s.startedAt) >= weekAgo)
  }

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

async function openDetail(session: Session) {
  activeSession.value      = session
  selectedPreviewUrl.value = session.outputUrl || session.photos?.[0]?.dataUrl || null
  reprintFeedback.value    = ''

  if (!selectedPreviewUrl.value) {
    try {
      const outputBlob = await sessionPhotosDB.getDataUrl(session.id, -1)
      if (outputBlob) {
        session.outputUrl = outputBlob
        selectedPreviewUrl.value = outputBlob
      } else {
        const firstPhoto = await sessionPhotosDB.getDataUrl(session.id, 0)
        if (firstPhoto) {
          selectedPreviewUrl.value = firstPhoto
        }
      }
    } catch {}
  }
}

function closeDetail() {
  activeSession.value      = null
  selectedPreviewUrl.value = null
}

function exportSessionsJSON() {
  if (sessionStore.history.length === 0) return
  const data = {
    exportedAt: new Date().toISOString(),
    totalSessions: sessionStore.history.length,
    sessions: sessionStore.history,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  const dateStr = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `photobooth-sessions-${dateStr}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

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

async function triggerReprint() {
  if (!activeSession.value) return
  isReprinting.value    = true
  reprintFeedback.value = ''
  try {
    const job = await sessionStore.reprintSession(activeSession.value.id, 1)
    if (job && job.status === 'COMPLETED') {
      reprintFeedback.value = '✓ Perintah cetak berhasil dikirim'
    } else {
      reprintFeedback.value = '✕ Cetak dibatalkan atau gagal'
    }
    setTimeout(() => { reprintFeedback.value = '' }, 3500)
  } finally {
    isReprinting.value = false
  }
}

async function quickReprint(session: Session) {
  await sessionStore.reprintSession(session.id, 1)
}

function confirmDelete(session: Session) {
  sessionToDelete.value = session
}

async function executeDelete() {
  if (!sessionToDelete.value) return
  const id = sessionToDelete.value.id
  if (activeSession.value?.id === id) closeDetail()
  await sessionStore.deleteSession(id)
  sessionToDelete.value = null
}

function formatTime(isoStr: string): string {
  if (!isoStr) return ''
  return new Date(isoStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function formatDateTime(isoStr: string): string {
  if (!isoStr) return ''
  return new Date(isoStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
