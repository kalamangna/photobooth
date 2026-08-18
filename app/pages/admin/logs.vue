<template>
  <div class="max-w-7xl mx-auto flex flex-col gap-6">

    <!-- ── Role Restriction Alert for Operators ─────────────── -->
    <div
      v-if="!auth.isAdmin.value"
      class="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col items-center text-center gap-4 my-8 max-w-xl mx-auto shadow-xl"
    >
      <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
        <Icon name="lucide:file-text" class="w-6 h-6" />
      </div>
      <div>
        <h2 class="text-xl font-bold text-zinc-100">Khusus Akun Admin</h2>
        <p class="text-xs sm:text-sm text-zinc-400 mt-1">Hanya akun Admin yang dapat mengakses riwayat log sistem.</p>
      </div>
      <NuxtLink
        to="/admin"
        class="mt-2 text-zinc-950 bg-amber-500 hover:bg-amber-400 font-bold rounded-xl text-xs px-5 py-2.5 transition-all"
      >
        Kembali ke Dashboard
      </NuxtLink>
    </div>

    <!-- ── Admin Log View ────────────────────────────────────── -->
    <div v-else class="flex flex-col gap-6">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-zinc-100">Log Sistem</h1>
          <p class="text-xs sm:text-sm text-zinc-400">Audit jejak aktivitas operasional dan diagnosa error</p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            @click="loadLogs"
            class="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Icon name="lucide:refresh-cw" class="w-4 h-4" :class="isLoading ? 'animate-spin' : ''" />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            @click="exportLogsJSON"
            :disabled="logs.length === 0"
            class="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Icon name="lucide:download" class="w-4 h-4 text-amber-400" />
            <span>Ekspor JSON</span>
          </button>

          <button
            type="button"
            @click="showClearLogsModal = true"
            :disabled="logs.length === 0"
            class="px-4 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Icon name="lucide:trash-2" class="w-4 h-4" />
            <span>Bersihkan Log</span>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div class="relative flex-1">
          <Icon name="lucide:search" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari pesan log, modul, atau event…"
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

        <div class="flex items-center gap-2">
          <select
            v-model="selectedLevel"
            class="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:border-amber-500 outline-none"
          >
            <option value="all">Semua Level</option>
            <option value="info">Info</option>
            <option value="warn">Peringatan (Warn)</option>
            <option value="error">Error</option>
          </select>

          <select
            v-model="selectedModule"
            class="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:border-amber-500 outline-none"
          >
            <option value="all">Semua Modul</option>
            <option v-for="m in availableModules" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
      </div>

      <!-- Log Table -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
        <div v-if="isLoading" class="py-16 flex flex-col items-center justify-center gap-3 text-zinc-400">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-amber-400" />
          <span class="text-xs">Memuat data log…</span>
        </div>

        <div v-else-if="filteredLogs.length === 0" class="py-16 flex flex-col items-center justify-center gap-2 text-center">
          <Icon name="lucide:file-text" class="w-8 h-8 text-zinc-600" />
          <p class="text-sm font-bold text-zinc-200">Tidak Ada Catatan Log</p>
          <p class="text-xs text-zinc-400">Tidak ditemukan log yang sesuai dengan filter atau kata kunci pencarian.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs text-zinc-300">
            <thead class="bg-zinc-850/80 border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
              <tr>
                <th scope="col" class="px-5 py-3.5 w-24">Level</th>
                <th scope="col" class="px-5 py-3.5 w-36">Modul</th>
                <th scope="col" class="px-5 py-3.5">Pesan</th>
                <th scope="col" class="px-5 py-3.5 w-44">Waktu</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800/80 font-sans">
              <tr
                v-for="log in filteredLogs"
                :key="log.id || log.timestamp"
                class="hover:bg-zinc-800/40 transition-colors"
              >
                <td class="px-5 py-3.5 whitespace-nowrap">
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border" :class="getLevelBadge(log.level)">
                    {{ log.level }}
                  </span>
                </td>
                <td class="px-5 py-3.5 font-bold text-zinc-100 whitespace-nowrap">
                  {{ log.module }}
                  <div class="text-[10px] text-zinc-500 font-mono font-normal">{{ log.event }}</div>
                </td>
                <td class="px-5 py-3.5 font-mono text-[11px] text-zinc-300 break-all">
                  {{ log.message }}
                </td>
                <td class="px-5 py-3.5 whitespace-nowrap text-[11px] text-zinc-500 font-mono">
                  {{ formatLogTime(log.timestamp) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Clear Modal -->
      <div
        v-if="showClearLogsModal"
        class="fixed inset-0 z-60 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm"
        @click.self="showClearLogsModal = false"
      >
        <div class="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-center">
          <div class="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <Icon name="lucide:alert-circle" class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-base font-bold text-zinc-100">Bersihkan Riwayat Log?</h3>
            <p class="text-xs text-zinc-400 mt-1">
              Seluruh riwayat catatan log sistem akan dihapus permanen dari memori browser.
            </p>
          </div>
          <div class="flex items-center gap-2 pt-2">
            <button
              type="button"
              @click="showClearLogsModal = false"
              class="flex-1 py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              @click="executeClearLogs"
              class="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 text-xs font-bold transition-all"
            >
              Ya, Bersihkan
            </button>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { logsDB, type SystemLog } from '~/services/db'
import { useAuth }                from '~/composables/useAuth'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Log Sistem — RD Photobooth' })

const auth = useAuth()

const logs               = ref<SystemLog[]>([])
const isLoading          = ref(false)
const searchQuery        = ref('')
const selectedLevel      = ref<'all' | 'info' | 'warn' | 'error'>('all')
const selectedModule     = ref('all')
const showClearLogsModal = ref(false)

async function loadLogs() {
  isLoading.value = true
  try {
    const all  = await logsDB.getAll()
    logs.value = all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  } catch (err) {
    console.error('Failed to load logs:', err)
  } finally {
    isLoading.value = false
  }
}

const availableModules = computed(() => {
  const set = new Set<string>()
  logs.value.forEach(l => {
    if (l.module) set.add(l.module)
  })
  return Array.from(set)
})

const filteredLogs = computed(() => {
  let list = logs.value

  if (selectedLevel.value !== 'all') {
    list = list.filter(l => l.level === selectedLevel.value)
  }

  if (selectedModule.value !== 'all') {
    list = list.filter(l => l.module === selectedModule.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(l =>
      l.message.toLowerCase().includes(q) ||
      l.module.toLowerCase().includes(q) ||
      l.event.toLowerCase().includes(q) ||
      l.timestamp.includes(q)
    )
  }

  return list
})

function getLevelBadge(level: string): string {
  switch (level) {
    case 'error':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    case 'warn':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    case 'info':
    default:
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  }
}

function formatLogTime(isoStr: string): string {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return d.toLocaleString('id-ID', {
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day:    'numeric',
    month:  'short',
    year:   'numeric',
  })
}

function exportLogsJSON() {
  if (logs.value.length === 0) return
  const data = {
    exportedAt: new Date().toISOString(),
    totalLogs:  logs.value.length,
    logs:       logs.value,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  const dateStr = new Date().toISOString().slice(0, 10)
  a.href     = url
  a.download = `photobooth-logs-${dateStr}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function executeClearLogs() {
  showClearLogsModal.value = false
  try {
    for (const l of logs.value) {
      if (l.id) await logsDB.delete(l.id)
    }
    logs.value = []
  } catch (err) {
    console.error('Failed to clear logs:', err)
  }
}

onMounted(async () => {
  await loadLogs()
})
</script>
