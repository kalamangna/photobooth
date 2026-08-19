<template>
  <div class="min-h-[100dvh] bg-zinc-950 text-zinc-100 flex flex-col items-center justify-between p-4 sm:p-6 select-none relative overflow-x-hidden">

    <!-- Background Ambient Glow -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />

    <!-- ── Header ──────────────────────────────────────────────── -->
    <header class="w-full max-w-sm flex items-center justify-between py-2 relative z-10">
      <div class="flex items-center gap-2">
        <Icon name="lucide:sparkles" class="w-5 h-5 text-amber-400 shrink-0" />
        <span class="font-bold text-sm tracking-tight text-zinc-100 truncate">
          {{ eventName || 'RD Photobooth' }}
        </span>
      </div>
      <span class="text-[11px] font-mono text-zinc-400 shrink-0">{{ formattedDate }}</span>
    </header>

    <!-- ── Main Content / Photo Card ───────────────────────────── -->
    <main class="w-full max-w-sm flex-1 flex flex-col items-center justify-center my-4 relative z-10">

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center gap-3 py-16">
        <Icon name="lucide:loader-2" class="w-8 h-8 text-amber-400 animate-spin" />
        <span class="text-xs text-zinc-400 font-medium">Memuat foto Anda…</span>
      </div>

      <!-- Error / Not Found State -->
      <div v-else-if="!photoUrl" class="w-full p-8 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col items-center gap-3 text-center">
        <div class="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <Icon name="lucide:alert-circle" class="w-6 h-6" />
        </div>
        <h2 class="text-base font-bold text-zinc-100">Foto Tidak Ditemukan</h2>
        <p class="text-xs text-zinc-400 leading-relaxed">
          Pastikan perangkat Anda terhubung ke jaringan Wi-Fi photobooth yang sama.
        </p>
      </div>

      <!-- Photo Card -->
      <div v-else class="w-full flex flex-col items-center gap-3">
        <div class="w-full rounded-3xl bg-zinc-900/80 border border-zinc-800 p-3 shadow-2xl overflow-hidden relative group">
          <img
            :src="photoUrl"
            class="w-full h-auto max-h-[62dvh] object-contain rounded-2xl shadow-md"
            :alt="eventName || 'Foto Photobooth'"
          />
        </div>
      </div>
    </main>

    <!-- ── Action Buttons Footer ───────────────────────────────── -->
    <footer v-if="photoUrl" class="w-full max-w-sm flex flex-col gap-2.5 relative z-10 pb-4">
      <button
        id="btn-download-photo"
        class="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 min-h-[52px]"
        @click="downloadPhoto"
      >
        <Icon name="lucide:download" class="w-5 h-5" />
        <span>{{ downloadStatus || 'Download Foto' }}</span>
      </button>

      <button
        v-if="canShare"
        id="btn-share-photo"
        class="w-full py-3.5 px-6 rounded-2xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 font-bold text-xs sm:text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 min-h-[46px]"
        @click="sharePhoto"
      >
        <Icon name="lucide:share-2" class="w-4 h-4 text-amber-400" />
        <span>Bagikan</span>
      </button>

      <div class="flex items-center justify-center pt-2">
        <span class="font-mono text-[10px] font-bold tracking-[0.24em] uppercase text-zinc-600">
          RD PHOTOBOOTH
        </span>
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { sessionsDB, sessionPhotosDB } from '~/services/db'

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Download Foto — RD Photobooth',
  description: 'Download foto photobooth Anda.',
})

const route          = useRoute()
const sessionId      = route.params.id as string
const isLoading      = ref(true)
const photoUrl       = ref<string | null>(null)
const eventName      = ref('')
const startedAt      = ref('')
const downloadStatus = ref('')
const canShare       = ref(false)

const formattedDate = computed(() => {
  if (!startedAt.value) return ''
  return new Date(startedAt.value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
})

onMounted(async () => {
  canShare.value = typeof navigator !== 'undefined' && Boolean(navigator.share)

  try {
    // 1. Try server API
    const serverSession = await $fetch<Record<string, unknown>>(`/api/sessions/${sessionId}`).catch(() => null)
    if (serverSession) {
      eventName.value = (serverSession.eventName as string) || ''
      startedAt.value = (serverSession.startedAt as string) || ''
      photoUrl.value  = (serverSession.cloudUrl as string) || (serverSession.outputUrl as string) || null
    }

    // 2. Fallback ke local IndexedDB session doc (device yang sama)
    if (!photoUrl.value) {
      const local = await sessionsDB.get(sessionId) as Record<string, unknown> | undefined
      if (local) {
        if (!eventName.value) eventName.value = (local.eventName as string) || ''
        if (!startedAt.value) startedAt.value = (local.startedAt as string) || ''
        photoUrl.value = (local.cloudUrl as string) || (local.outputUrl as string) || null
      }
    }

    // 3. Fallback ke sessionPhotosDB Blob store (output composite, slot -1)
    if (!photoUrl.value) {
      const outputDataUrl = await sessionPhotosDB.getDataUrl(sessionId, -1)
      if (outputDataUrl) photoUrl.value = outputDataUrl
    }

    // 4. Last resort: foto pertama dari Blob store (slot 0)
    if (!photoUrl.value) {
      const firstPhoto = await sessionPhotosDB.getDataUrl(sessionId, 0)
      if (firstPhoto) photoUrl.value = firstPhoto
    }
  } finally {
    isLoading.value = false
  }
})

function downloadPhoto() {
  if (!photoUrl.value) return
  const cleanName = (eventName.value || 'photobooth').toLowerCase().replace(/\s+/g, '-')
  const filename = `${cleanName}-${sessionId}.png`

  const link = document.createElement('a')
  link.href = photoUrl.value
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  downloadStatus.value = '✓ Foto Berhasil Didownload!'
  setTimeout(() => {
    downloadStatus.value = ''
  }, 3000)
}

async function sharePhoto() {
  if (!photoUrl.value || !navigator.share) return

  try {
    // Convert base64 to Blob file for native OS sharing
    const res = await fetch(photoUrl.value)
    const blob = await res.blob()
    const file = new File([blob], `photobooth-${sessionId}.png`, { type: 'image/png' })

    await navigator.share({
      title: eventName.value || 'Foto Photobooth',
      text: `Foto dari ${eventName.value || 'RD Photobooth'}!`,
      files: [file],
    })
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      // Fallback to regular download
      downloadPhoto()
    }
  }
}
</script>
