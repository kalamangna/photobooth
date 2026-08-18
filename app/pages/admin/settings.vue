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
          <h1 class="text-2xl font-bold tracking-tight text-zinc-100">Pengaturan Sistem</h1>
          <p class="text-xs sm:text-sm text-zinc-400">Keamanan autentikasi PIN dan manajemen data</p>
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
            <span>{{ isSaving ? 'Menyimpan…' : 'Simpan Pengaturan' }}</span>
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
              <h2 class="text-base font-bold text-zinc-100">Keamanan Akses (PIN)</h2>
              <p class="text-xs text-zinc-400">Kunci 6-digit untuk masuk ke panel control</p>
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <!-- PIN Admin -->
            <div>
              <label for="admin-pin-input" class="block text-xs font-semibold text-zinc-300 mb-1.5">
                PIN Admin (Akses Penuh):
              </label>
              <div class="relative">
                <input
                  id="admin-pin-input"
                  v-model="inputAdminPin"
                  :type="showAdminPin ? 'text' : 'password'"
                  maxlength="6"
                  placeholder="888888"
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
                PIN Operator (Operasional Lokasi):
              </label>
              <div class="relative">
                <input
                  id="operator-pin-input"
                  v-model="inputOperatorPin"
                  :type="showOperatorPin ? 'text' : 'password'"
                  maxlength="6"
                  placeholder="123456"
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

        <!-- 2. Danger Zone & Pembersihan Data -->
        <div class="p-6 bg-zinc-900 border border-rose-500/20 rounded-2xl flex flex-col justify-between gap-5 shadow-lg">
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <div class="p-2 bg-rose-500/10 rounded-xl text-rose-400">
                <Icon name="lucide:trash-2" class="w-5 h-5" />
              </div>
              <div>
                <h2 class="text-base font-bold text-zinc-100">Penyimpanan & Danger Zone</h2>
                <p class="text-xs text-zinc-400">Hapus riwayat sesi untuk mengosongkan memori</p>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex flex-col gap-2">
              <p class="text-xs font-bold text-zinc-200">Hapus Sesi Hari Ini</p>
              <p class="text-[11px] text-zinc-400">
                Menghapus foto dan sesi yang diambil pada hari ini saja. Sesi hari sebelumnya tetap tersimpan.
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="showClearModal = true"
            class="w-full py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 active:scale-95 text-zinc-950 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Icon name="lucide:trash-2" class="w-4 h-4" />
            <span>Hapus Sesi Hari Ini</span>
          </button>
        </div>

      </div>

      <!-- Clear Today Confirmation Modal -->
      <div
        v-if="showClearModal"
        class="fixed inset-0 z-60 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm"
        @click.self="showClearModal = false"
      >
        <div class="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-center">
          <div class="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <Icon name="lucide:alert-circle" class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-base font-bold text-zinc-100">Bersihkan Sesi Hari Ini?</h3>
            <p class="text-xs text-zinc-400 mt-1">
              Seluruh data foto dan riwayat sesi hari ini akan dihapus permanen dari memori browser lokal.
            </p>
          </div>
          <div class="flex items-center gap-2 pt-2">
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
              Ya, Bersihkan
            </button>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { useAuth }         from '~/composables/useAuth'
import { useSessionStore } from '~/stores/session'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Pengaturan — RD Photobooth' })

const auth         = useAuth()
const sessionStore = useSessionStore()

const inputAdminPin    = ref('888888')
const inputOperatorPin = ref('123456')
const showAdminPin     = ref(false)
const showOperatorPin  = ref(false)
const isSaving         = ref(false)
const saveFeedback     = ref('')
const showClearModal   = ref(false)

onMounted(async () => {
  await auth.loadPins()
  inputAdminPin.value    = auth.adminPin.value
  inputOperatorPin.value = auth.operatorPin.value
})

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

    saveFeedback.value = '✓ PIN keamanan berhasil diperbarui'
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
</script>
