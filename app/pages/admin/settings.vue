<template>
  <div class="flex flex-col gap-6 sm:gap-8 pb-16 select-none text-zinc-100 max-w-7xl mx-auto">

    <!-- ── Operator View: Pengaturan Sesi ──────────────────────── -->
    <div v-if="!auth.isAdmin.value" class="flex flex-col gap-6 sm:gap-8">
      <div class="border-b border-zinc-800 pb-5">
        <h1 class="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">Pengaturan</h1>
      </div>

      <!-- Nama Acara -->
      <div class="p-5 sm:p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-5 shadow-sm">
        <div class="flex items-center gap-3 pb-3.5 border-b border-zinc-800">
          <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Icon name="lucide:party-popper" class="w-4 h-4" />
          </div>
          <h2 class="text-sm font-bold text-zinc-100">Nama Acara</h2>
        </div>
        <div class="flex flex-col gap-2">
          <input
            id="op-event-name"
            v-model="eventName"
            type="text"
            class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 text-sm outline-none transition-colors"
            placeholder="Contoh: Sarah & Dimas Wedding"
            maxlength="60"
          />
        </div>
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <span v-if="saveFeedback" class="text-xs font-semibold text-emerald-400">{{ saveFeedback }}</span>
          <button
            class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            :disabled="isSaving"
            @click="saveSettings"
          >
            <Icon v-if="isSaving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            <Icon v-else name="lucide:save" class="w-4 h-4" />
            <span>{{ isSaving ? 'Menyimpan…' : 'Simpan' }}</span>
          </button>
        </div>
      </div>

      <!-- Alur Foto -->
      <div class="p-5 sm:p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-5 shadow-sm">
        <div class="flex items-center gap-3 pb-3.5 border-b border-zinc-800">
          <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Icon name="lucide:camera" class="w-4 h-4" />
          </div>
          <h2 class="text-sm font-bold text-zinc-100">Alur Pengambilan Foto</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <!-- Countdown -->
          <div class="flex flex-col gap-2">
            <label class="text-xs font-semibold text-zinc-300">Jeda Sebelum Foto</label>
            <div class="grid grid-cols-2 gap-2.5">
              <button
                v-for="cd in [3, 5]"
                :key="cd"
                type="button"
                class="py-2.5 px-3.5 rounded-xl border text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
                :class="countdown === cd
                  ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-sm'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'"
                @click="countdown = cd"
              >
                <Icon name="lucide:timer" class="w-4 h-4" />
                <span>{{ cd }} Detik</span>
              </button>
            </div>
          </div>

          <!-- Default Shots -->
          <div class="flex flex-col gap-2">
            <label class="text-xs font-semibold text-zinc-300">Jumlah Foto per Sesi</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="s in [1, 2, 3, 4]"
                :key="s"
                type="button"
                class="py-2.5 rounded-xl border text-sm font-semibold font-mono transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5"
                :class="defaultShots === s
                  ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-sm'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'"
                @click="defaultShots = s"
              >
                <span class="text-sm font-bold">{{ s }}</span>
                <span class="text-[10px] uppercase font-sans font-semibold">Foto</span>
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <span v-if="saveFeedback" class="text-xs font-semibold text-emerald-400">{{ saveFeedback }}</span>
          <button
            class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            :disabled="isSaving"
            @click="saveSettings"
          >
            <Icon v-if="isSaving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            <Icon v-else name="lucide:save" class="w-4 h-4" />
            <span>{{ isSaving ? 'Menyimpan…' : 'Simpan' }}</span>
          </button>
        </div>
      </div>
    </div>


    <!-- ── Full Settings View (Admin Only) ─────────────────── -->
    <template v-else>
      <!-- ── Header ──────────────────────────────────────────── -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <h1 class="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">Pengaturan</h1>

        <div class="flex items-center gap-3">
          <span v-if="saveFeedback" class="text-xs font-semibold text-emerald-400">
            {{ saveFeedback }}
          </span>
          <button
            id="btn-save-settings"
            class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            :disabled="isSaving"
            @click="saveSettings"
          >
            <Icon v-if="isSaving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            <Icon v-else name="lucide:save" class="w-4 h-4" />
            <span>{{ isSaving ? 'Menyimpan…' : 'Simpan Perubahan' }}</span>
          </button>
        </div>
      </div>

      <!-- ── Section 1: Event Identity ───────────────────────── -->
      <div class="p-5 sm:p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-5 shadow-sm">
        <div class="flex items-center gap-3 pb-3.5 border-b border-zinc-800">
          <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Icon name="lucide:party-popper" class="w-4 h-4" />
          </div>
          <h2 class="text-sm font-bold text-zinc-100">Identitas Acara</h2>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-xs font-semibold text-zinc-300" for="setting-event-name">Nama Acara / Brand</label>
          <input
            id="setting-event-name"
            v-model="eventName"
            type="text"
            class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 text-sm outline-none transition-colors"
            placeholder="Contoh: Sarah & Dimas Wedding"
            maxlength="60"
          />
          <span class="text-xs text-zinc-500">Maksimal 60 karakter. Teks ini akan disinkronkan ke seluruh template aktif.</span>
        </div>
      </div>

      <!-- ── Section 2: Session & Capture Setup ──────────────── -->
      <div class="p-5 sm:p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-5 shadow-sm">
        <div class="flex items-center gap-3 pb-3.5 border-b border-zinc-800">
          <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Icon name="lucide:camera" class="w-4 h-4" />
          </div>
          <h2 class="text-sm font-bold text-zinc-100">Alur Pengambilan Foto</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <!-- Countdown -->
          <div class="flex flex-col gap-2">
            <label class="text-xs font-semibold text-zinc-300">Waktu Hitung Mundur</label>
            <div class="grid grid-cols-2 gap-2.5">
              <button
                v-for="cd in [3, 5]"
                :key="cd"
                type="button"
                class="py-2.5 px-3.5 rounded-xl border text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
                :class="countdown === cd
                  ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-sm'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'"
                @click="countdown = cd"
              >
                <Icon name="lucide:timer" class="w-4 h-4" />
                <span>{{ cd }} Detik</span>
              </button>
            </div>
            <span class="text-xs text-zinc-500">Durasi jeda sebelum tiap jepretan foto.</span>
          </div>

          <!-- Default Shots -->
          <div class="flex flex-col gap-2">
            <label class="text-xs font-semibold text-zinc-300">Default Jumlah Foto</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="s in [1, 2, 3, 4]"
                :key="s"
                type="button"
                class="py-2.5 rounded-xl border text-sm font-semibold font-mono transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5"
                :class="defaultShots === s
                  ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-sm'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'"
                @click="defaultShots = s"
              >
                <span class="text-sm font-bold">{{ s }}</span>
                <span class="text-[10px] uppercase font-sans font-semibold">Foto</span>
              </button>
            </div>
            <span class="text-xs text-zinc-500">Jumlah foto default per sesi tamu.</span>
          </div>
        </div>
      </div>

      <!-- ── Section 3: Operator & Admin PIN Security ────────── -->
      <div class="p-5 sm:p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-5 shadow-sm">
        <div class="flex items-center gap-3 pb-3.5 border-b border-zinc-800">
          <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Icon name="lucide:shield-check" class="w-4 h-4" />
          </div>
          <h2 class="text-sm font-bold text-zinc-100">PIN Akses Sistem (2 Role)</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <!-- Admin PIN -->
          <div class="flex flex-col gap-2">
            <label class="text-xs font-semibold text-amber-400 flex items-center gap-1.5" for="setting-admin-pin">
              <Icon name="lucide:crown" class="w-3.5 h-3.5 text-amber-400" />
              <span>PIN Admin (Akses Penuh)</span>
            </label>
            <div class="relative">
              <Icon name="lucide:lock" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="setting-admin-pin"
                v-model="inputAdminPin"
                :type="showAdminPin ? 'text' : 'password'"
                inputmode="numeric"
                maxlength="6"
                class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-950 border border-amber-500/40 focus:border-amber-400 text-zinc-100 font-mono text-sm tracking-widest outline-none transition-colors"
                placeholder="888888"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                @click="showAdminPin = !showAdminPin"
              >
                <Icon :name="showAdminPin ? 'lucide:eye-off' : 'lucide:eye'" class="w-4 h-4" />
              </button>
            </div>
            <span class="text-xs text-zinc-500">Default: 888888 (6 digit). Dapat mengakses semua fitur & pengaturan.</span>
          </div>

          <!-- Operator PIN -->
          <div class="flex flex-col gap-2">
            <label class="text-xs font-semibold text-sky-400 flex items-center gap-1.5" for="setting-operator-pin">
              <Icon name="lucide:user-check" class="w-3.5 h-3.5 text-sky-400" />
              <span>PIN Operator (Kru Lapangan)</span>
            </label>
            <div class="relative">
              <Icon name="lucide:lock" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="setting-operator-pin"
                v-model="inputOperatorPin"
                :type="showOperatorPin ? 'text' : 'password'"
                inputmode="numeric"
                maxlength="6"
                class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-950 border border-sky-500/40 focus:border-sky-400 text-zinc-100 font-mono text-sm tracking-widest outline-none transition-colors"
                placeholder="123456"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                @click="showOperatorPin = !showOperatorPin"
              >
                <Icon :name="showOperatorPin ? 'lucide:eye-off' : 'lucide:eye'" class="w-4 h-4" />
              </button>
            </div>
            <span class="text-xs text-zinc-500">Default: 123456 (6 digit). Khusus operasional & print.</span>
          </div>
        </div>
      </div>

      <!-- ── Section 4: Data Storage & Maintenance ──────────── -->
      <div class="p-5 sm:p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-5 shadow-sm">
        <div class="flex items-center gap-3 pb-3.5 border-b border-zinc-800">
          <div class="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Icon name="lucide:trash-2" class="w-4 h-4" />
          </div>
          <h2 class="text-sm font-bold text-zinc-100">Penyimpanan & Manajemen Data</h2>
        </div>

        <div class="p-4 bg-zinc-950 border border-rose-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex flex-col gap-0.5">
            <span class="text-sm font-semibold text-zinc-200">Hapus Riwayat Sesi Hari Ini</span>
            <span class="text-xs text-zinc-500">Tindakan ini akan mengosongkan database foto yang diambil hari ini.</span>
          </div>
          <button
            class="py-2.5 px-4 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-all active:scale-95 shrink-0"
            @click="showClearModal = true"
          >
            Hapus Sesi Hari Ini
          </button>
        </div>
      </div>

      <!-- ── Confirmation Modal Dialog ────────────────────────── -->
      <Transition
        enter-active-class="transition-opacity duration-150 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showClearModal"
          class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          @click.self="showClearModal = false"
        >
          <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-2xl">
            <div class="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Icon name="lucide:alert-triangle" class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-zinc-100">Hapus Sesi Hari Ini?</h3>
              <p class="text-xs text-zinc-400 mt-1">
                Seluruh data foto dan output strip hari ini akan dihapus permanen dari memori lokal.
              </p>
            </div>
            <div class="flex items-center gap-2 pt-2">
              <button
                class="flex-1 py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all active:scale-95"
                @click="showClearModal = false"
              >
                Batal
              </button>
              <button
                class="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 text-xs font-bold transition-all active:scale-95 shadow-md shadow-rose-500/20"
                @click="executeClearToday"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </template>

  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import { settingsDB }      from '~/services/db'
import { useAuth }         from '~/composables/useAuth'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Pengaturan — Admin' })

const sessionStore = useSessionStore()
const auth         = useAuth()

const eventName        = ref('')
const inputAdminPin    = ref('888888')
const inputOperatorPin = ref('123456')
const showAdminPin     = ref(false)
const showOperatorPin  = ref(false)
const countdown        = ref(5)
const defaultShots     = ref(3)
const isSaving         = ref(false)
const saveFeedback     = ref('')
const showClearModal   = ref(false)

onMounted(async () => {
  await auth.loadPins()
  inputAdminPin.value    = auth.adminPin.value
  inputOperatorPin.value = auth.operatorPin.value

  const savedEvent = (await settingsDB.get<string>('activeEventName'))
    || (typeof localStorage !== 'undefined' ? localStorage.getItem('photobooth_event_name') : null)
  const savedCd    = await settingsDB.get<number>('activeCountdown')
  const savedShots = await settingsDB.get<number>('lastTotalShots')
  if (savedEvent) eventName.value    = savedEvent
  if (savedCd)    countdown.value    = savedCd
  if (savedShots) defaultShots.value = savedShots
})

async function saveSettings() {
  isSaving.value = true
  saveFeedback.value = ''
  try {
    const trimmedEvent = eventName.value.trim()
    await settingsDB.set('activeEventName', trimmedEvent)
    if (typeof localStorage !== 'undefined') localStorage.setItem('photobooth_event_name', trimmedEvent)

    if (inputAdminPin.value.trim().length === 6) {
      await auth.updateAdminPin(inputAdminPin.value.trim())
    }
    if (inputOperatorPin.value.trim().length === 6) {
      await auth.updateOperatorPin(inputOperatorPin.value.trim())
    }

    await settingsDB.set('activeCountdown', countdown.value)
    await settingsDB.set('lastTotalShots', defaultShots.value)
    saveFeedback.value = '✓ Perubahan tersimpan'
    setTimeout(() => { saveFeedback.value = '' }, 2500)
  } finally {
    isSaving.value = false
  }
}

async function executeClearToday() {
  showClearModal.value = false
  await sessionStore.clearTodaySessions()
  saveFeedback.value = '✓ Sesi hari ini telah dibersihkan'
  setTimeout(() => { saveFeedback.value = '' }, 2500)
}
</script>
