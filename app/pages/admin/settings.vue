<template>
  <div class="max-w-7xl mx-auto flex flex-col gap-6">

    <!-- ── Role Restriction Alert for Operators ─────────────── -->
    <div
      v-if="!auth.isAdmin.value"
      class="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col items-center text-center gap-4 my-8 max-w-xl mx-auto shadow-xl"
    >
      <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
        <Icon name="lucide:settings" class="w-6 h-6" />
      </div>
      <div>
        <h2 class="text-xl font-bold text-zinc-100">Khusus Akun Admin</h2>
        <p class="text-xs sm:text-sm text-zinc-400 mt-1">Hanya akun Admin yang dapat mengubah pengaturan keamanan dan sistem.</p>
      </div>
      <NuxtLink
        to="/admin"
        class="mt-2 text-zinc-950 bg-amber-500 hover:bg-amber-400 font-bold rounded-xl text-xs px-5 py-2.5 transition-all"
      >
        Kembali ke Dashboard
      </NuxtLink>
    </div>

    <!-- ── Admin Settings ────────────────────────────────────── -->
    <div v-else class="flex flex-col gap-6">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-zinc-100">Pengaturan</h1>
          <p class="text-xs sm:text-sm text-zinc-400">PIN akses, penyimpanan cloud, dan hapus data</p>
        </div>

        <div class="flex items-center gap-3">
          <span v-if="saveFeedback" class="text-xs font-semibold text-emerald-400">
            {{ saveFeedback }}
          </span>

          <button
            type="button"
            @click="saveSettings"
            :disabled="isSaving"
            class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Icon v-if="isSaving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            <Icon v-else name="lucide:save" class="w-4 h-4" />
            <span>{{ isSaving ? 'Menyimpan…' : 'Simpan' }}</span>
          </button>
        </div>
      </div>

      <!-- Settings Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- 1. PIN Admin & Operator -->
        <div class="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-5 shadow-lg">
          <div class="flex items-center gap-3 border-b border-zinc-800 pb-3">
            <div class="p-2 bg-amber-500/10 rounded-xl text-amber-400">
              <Icon name="lucide:shield-check" class="w-5 h-5" />
            </div>
            <div>
              <h2 class="text-base font-bold text-zinc-100">PIN Akses</h2>
              <p class="text-xs text-zinc-400">Kunci PIN untuk login admin dan operator</p>
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <!-- PIN Admin -->
            <div>
              <label for="admin-pin-input" class="block text-xs font-semibold text-zinc-300 mb-1.5">
                PIN Admin
              </label>
              <div class="relative">
                <input
                  id="admin-pin-input"
                  v-model="inputAdminPin"
                  :type="showAdminPin ? 'text' : 'password'"
                  maxlength="6"
                  placeholder="Ketik PIN baru (6 digit)"
                  class="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-sm font-mono tracking-widest text-zinc-100 placeholder-zinc-500 focus:border-amber-500 outline-none"
                />
                <button
                  type="button"
                  @click="showAdminPin = !showAdminPin"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                >
                  <Icon :name="showAdminPin ? 'lucide:eye-off' : 'lucide:eye'" class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- PIN Operator -->
            <div>
              <label for="operator-pin-input" class="block text-xs font-semibold text-zinc-300 mb-1.5">
                PIN Operator
              </label>
              <div class="relative">
                <input
                  id="operator-pin-input"
                  v-model="inputOperatorPin"
                  :type="showOperatorPin ? 'text' : 'password'"
                  maxlength="6"
                  placeholder="Ketik PIN baru (6 digit)"
                  class="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-sm font-mono tracking-widest text-zinc-100 placeholder-zinc-500 focus:border-amber-500 outline-none"
                />
                <button
                  type="button"
                  @click="showOperatorPin = !showOperatorPin"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                >
                  <Icon :name="showOperatorPin ? 'lucide:eye-off' : 'lucide:eye'" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Penyimpanan Cloud (Cloudinary) -->
        <div class="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between gap-5 shadow-lg">
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <div class="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                <Icon name="lucide:cloud" class="w-5 h-5" />
              </div>
              <div>
                <h2 class="text-base font-bold text-zinc-100">Penyimpanan Cloud</h2>
                <p class="text-xs text-zinc-400">Unggah foto ke cloud untuk scan QR online</p>
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <div>
                <label for="cloud-name-input" class="block text-xs font-semibold text-zinc-300 mb-1">
                  Cloud Name
                </label>
                <input
                  id="cloud-name-input"
                  v-model="cloudinaryCloudName"
                  type="text"
                  placeholder="Contoh: dxy12345"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 outline-none font-mono"
                />
              </div>

              <div>
                <label for="cloud-preset-input" class="block text-xs font-semibold text-zinc-300 mb-1">
                  Upload Preset (Unsigned)
                </label>
                <input
                  id="cloud-preset-input"
                  v-model="cloudinaryPreset"
                  type="text"
                  placeholder="Contoh: photobooth_preset"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 outline-none font-mono"
                />
              </div>

              <div>
                <label for="cloud-folder-input" class="block text-xs font-semibold text-zinc-300 mb-1">
                  Folder Cloud
                </label>
                <input
                  id="cloud-folder-input"
                  v-model="cloudinaryFolder"
                  type="text"
                  placeholder="rd-photobooth"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <!-- Test Connection Row -->
          <div class="pt-2 border-t border-zinc-800/80 flex flex-col gap-2">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[11px] text-zinc-400">Gunakan preset bertipe <b class="text-zinc-200">Unsigned</b> di Cloudinary.</span>
              <button
                type="button"
                @click="testCloudinaryConnection"
                :disabled="isTestingCloud || !cloudinaryCloudName || !cloudinaryPreset"
                class="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 active:scale-95 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 shrink-0"
              >
                <Icon v-if="isTestingCloud" name="lucide:loader-2" class="w-3.5 h-3.5 animate-spin" />
                <Icon v-else name="lucide:zap" class="w-3.5 h-3.5" />
                <span>Uji Koneksi</span>
              </button>
            </div>
            <span v-if="cloudTestFeedback" class="text-[11px] font-semibold" :class="cloudTestFeedback.startsWith('✓') ? 'text-emerald-400' : 'text-rose-400'">
              {{ cloudTestFeedback }}
            </span>
          </div>
        </div>

        <!-- 3. Danger Zone & Pembersihan Data -->
        <div class="p-6 bg-zinc-900 border border-rose-500/20 rounded-2xl flex flex-col justify-between gap-5 shadow-lg lg:col-span-2">
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <div class="p-2 bg-rose-500/10 rounded-xl text-rose-400">
                <Icon name="lucide:trash-2" class="w-5 h-5" />
              </div>
              <div>
                <h2 class="text-base font-bold text-zinc-100">Hapus Data Sesi</h2>
                <p class="text-xs text-zinc-400">Bersihkan riwayat foto dari memori lokal</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-zinc-850 border border-zinc-800 flex flex-col justify-between gap-3">
                <div class="flex flex-col gap-1">
                  <p class="text-xs font-bold text-zinc-200">Sesi Hari Ini</p>
                  <p class="text-[11px] text-zinc-400">
                    Hapus sesi hari ini saja. Sesi hari sebelumnya tetap tersimpan.
                  </p>
                </div>
                <button
                  type="button"
                  @click="showClearModal = true"
                  class="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 active:scale-95 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5 self-start"
                >
                  <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
                  <span>Hapus Hari Ini</span>
                </button>
              </div>

              <div class="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex flex-col justify-between gap-3">
                <div class="flex flex-col gap-1">
                  <p class="text-xs font-bold text-rose-300">Semua Sesi</p>
                  <p class="text-[11px] text-zinc-400">
                    Hapus seluruh data foto dan riwayat sesi secara permanen.
                  </p>
                </div>
                <button
                  type="button"
                  @click="showClearAllModal = true"
                  class="py-2 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 active:scale-95 text-zinc-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md self-start"
                >
                  <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
                  <span>Hapus Semua</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ── Flowbite Modal: Clear Today Confirmation ────────── -->
      <FlowbiteModal
        v-model="showClearModal"
        title="Hapus Sesi Hari Ini?"
        icon="lucide:alert-circle"
        icon-bg-class="bg-rose-500/10 text-rose-400 border border-rose-500/30"
        size="sm"
      >
        <p class="text-xs text-zinc-400">
          Seluruh data foto dan sesi hari ini akan dihapus permanen.
        </p>

        <template #footer>
          <button
            type="button"
            @click="showClearModal = false"
            class="flex-1 py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            @click="executeClearToday"
            class="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 text-xs font-bold transition-all"
          >
            Hapus
          </button>
        </template>
      </FlowbiteModal>

      <!-- ── Flowbite Modal: Clear All Confirmation ──────────── -->
      <FlowbiteModal
        v-model="showClearAllModal"
        title="Hapus Semua Sesi?"
        icon="lucide:trash-2"
        icon-bg-class="bg-rose-500/10 text-rose-400 border border-rose-500/30"
        size="sm"
      >
        <p class="text-xs text-zinc-400">
          Seluruh data foto dan riwayat sesi akan dihapus permanen.
        </p>

        <template #footer>
          <button
            type="button"
            @click="showClearAllModal = false"
            class="flex-1 py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            @click="executeClearAll"
            class="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 text-xs font-bold transition-all"
          >
            Hapus Semua
          </button>
        </template>
      </FlowbiteModal>

    </div>

  </div>
</template>

<script setup lang="ts">
import { useAuth }         from '~/composables/useAuth'
import { useSessionStore } from '~/stores/session'
import FlowbiteModal       from '~/components/ui/FlowbiteModal.vue'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Pengaturan — RD Photobooth' })

const auth         = useAuth()
const sessionStore = useSessionStore()

// Input PIN
const inputAdminPin    = ref('')
const inputOperatorPin = ref('')
const showAdminPin     = ref(false)
const showOperatorPin  = ref(false)

// Cloudinary
const cloudinaryCloudName = ref('')
const cloudinaryPreset    = ref('')
const cloudinaryFolder    = ref('rd-photobooth')
const isTestingCloud      = ref(false)
const cloudTestFeedback   = ref('')

const isSaving         = ref(false)
const saveFeedback     = ref('')
const showClearModal   = ref(false)
const showClearAllModal = ref(false)

onMounted(async () => {
  await auth.loadPins()
  try {
    const serverSettings = await $fetch<Record<string, unknown>>('/api/settings').catch(() => null)
    if (serverSettings) {
      if (typeof serverSettings.cloudinaryCloudName === 'string') {
        cloudinaryCloudName.value = serverSettings.cloudinaryCloudName
      }
      if (typeof serverSettings.cloudinaryPreset === 'string') {
        cloudinaryPreset.value = serverSettings.cloudinaryPreset
      }
      if (typeof serverSettings.cloudinaryFolder === 'string') {
        cloudinaryFolder.value = serverSettings.cloudinaryFolder
      }
    }
  } catch { /* ignore */ }
})

async function testCloudinaryConnection() {
  isTestingCloud.value    = true
  cloudTestFeedback.value = ''
  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/upload/test-cloudinary', {
      method: 'POST',
      body: {
        cloudName: cloudinaryCloudName.value,
        uploadPreset: cloudinaryPreset.value,
        folder: cloudinaryFolder.value,
      },
    })
    cloudTestFeedback.value = `✓ ${res.message}`
  } catch (err: any) {
    cloudTestFeedback.value = `✕ ${err.data?.message || err.message || 'Koneksi Cloudinary gagal'}`
  } finally {
    isTestingCloud.value = false
  }
}

async function saveSettings() {
  isSaving.value     = true
  saveFeedback.value = ''
  try {
    if (inputAdminPin.value.trim().length === 6) {
      await auth.updateAdminPin(inputAdminPin.value.trim())
    }
    if (inputOperatorPin.value.trim().length === 6) {
      await auth.updateOperatorPin(inputOperatorPin.value.trim())
    }

    // Save Cloudinary settings to server
    await $fetch('/api/settings', {
      method: 'POST',
      body: {
        cloudinaryCloudName: cloudinaryCloudName.value.trim(),
        cloudinaryPreset: cloudinaryPreset.value.trim(),
        cloudinaryFolder: cloudinaryFolder.value.trim(),
      },
    }).catch(() => {})

    saveFeedback.value = '✓ Pengaturan dan PIN berhasil disimpan'
    setTimeout(() => { saveFeedback.value = '' }, 3000)
  } finally {
    isSaving.value = false
  }
}

async function executeClearToday() {
  showClearModal.value = false
  await sessionStore.clearTodaySessions()
  saveFeedback.value = '✓ Sesi hari ini telah dibersihkan'
  setTimeout(() => { saveFeedback.value = '' }, 3000)
}

async function executeClearAll() {
  showClearAllModal.value = false
  await sessionStore.clearAllSessions()
  saveFeedback.value = '✓ Seluruh riwayat sesi telah dibersihkan'
  setTimeout(() => { saveFeedback.value = '' }, 3000)
}
</script>
