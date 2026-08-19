<template>
  <div class="max-w-7xl mx-auto flex flex-col gap-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-zinc-100">Acara</h1>
        <p class="text-xs sm:text-sm text-zinc-400">Nama acara, durasi timer, dan template default</p>
      </div>

      <div class="flex items-center gap-3">
        <span v-if="saveFeedback" class="text-xs font-semibold text-emerald-400">
          {{ saveFeedback }}
        </span>

        <button
          type="button"
          @click="saveEventSettings"
          :disabled="isSaving"
          class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Icon v-if="isSaving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <Icon v-else name="lucide:save" class="w-4 h-4" />
          <span>{{ isSaving ? 'Menyimpan…' : 'Simpan' }}</span>
        </button>
      </div>
    </div>

    <!-- Sections Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- 1. Identitas & Nama Acara -->
      <div class="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-4 shadow-lg">
        <div class="flex items-center gap-3 border-b border-zinc-800 pb-3">
          <div class="p-2 bg-amber-500/10 rounded-xl text-amber-400">
            <Icon name="lucide:party-popper" class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-bold text-zinc-100">Nama Acara</h2>
            <p class="text-xs text-zinc-400">Ditampilkan pada layar booth dan cetak</p>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label for="event-name-input" class="text-xs font-semibold text-zinc-300">Nama Acara</label>
          <input
            id="event-name-input"
            v-model="eventName"
            type="text"
            placeholder="Contoh: Sarah & Dimas Wedding"
            maxlength="60"
            class="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 outline-none transition-colors"
          />
          <div class="flex items-center justify-between mt-1">
            <span class="text-[10px] text-zinc-500">Maksimal 60 karakter</span>
            <button
              type="button"
              @click="eventName = 'RD Photobooth'"
              class="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              Reset ke Default
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Alur Pemotretan & Countdown -->
      <div class="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-4 shadow-lg">
        <div class="flex items-center gap-3 border-b border-zinc-800 pb-3">
          <div class="p-2 bg-amber-500/10 rounded-xl text-amber-400">
            <Icon name="lucide:timer" class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-bold text-zinc-100">Timer Hitung Mundur</h2>
            <p class="text-xs text-zinc-400">Jeda sebelum kamera mengambil foto</p>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-xs font-semibold text-zinc-300">Durasi Timer</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="cd in [3, 5]"
              :key="cd"
              type="button"
              @click="countdown = cd"
              class="py-3 px-4 rounded-xl border text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
              :class="countdown === cd
                ? 'bg-amber-500 border-amber-500 text-zinc-950 font-black shadow-md'
                : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-750'"
            >
              <Icon name="lucide:timer" class="w-4 h-4" />
              <span>{{ cd }} Detik</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 3. Template Default -->
      <div class="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-4 shadow-lg">
        <div class="flex items-center gap-3 border-b border-zinc-800 pb-3">
          <div class="p-2 bg-amber-500/10 rounded-xl text-amber-400">
            <Icon name="lucide:layout" class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-bold text-zinc-100">Template Default</h2>
            <p class="text-xs text-zinc-400">Template awal saat booth dibuka</p>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label for="default-template-select" class="text-xs font-semibold text-zinc-300">Pilih Template</label>
          <select
            id="default-template-select"
            v-model="selectedTemplateId"
            class="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-zinc-100 focus:border-amber-500 outline-none"
          >
            <option v-for="tpl in templateStore.templates" :key="tpl.id" :value="tpl.id">
              {{ tpl.name }} ({{ tpl.totalSlots }} Foto · {{ tpl.category }})
            </option>
          </select>
        </div>
      </div>

      <!-- 4. Otomasi & Efek Audio -->
      <div class="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-4 shadow-lg">
        <div class="flex items-center gap-3 border-b border-zinc-800 pb-3">
          <div class="p-2 bg-amber-500/10 rounded-xl text-amber-400">
            <Icon name="lucide:sliders" class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-bold text-zinc-100">Otomasi & Suara</h2>
            <p class="text-xs text-zinc-400">Cetak otomatis dan suara shutter</p>
          </div>
        </div>

        <div class="flex flex-col gap-4 pt-1">
          <!-- Auto Print Switch -->
          <label class="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-zinc-800/50 transition-colors">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-zinc-100">Cetak Otomatis</span>
              <span class="text-[11px] text-zinc-400">Cetak langsung setelah foto selesai</span>
            </div>
            <input type="checkbox" v-model="autoPrint" class="sr-only peer" />
            <div class="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 relative border border-zinc-700"></div>
          </label>

          <!-- Audio Feedback Switch -->
          <label class="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-zinc-800/50 transition-colors">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-zinc-100">Suara Shutter & Timer</span>
              <span class="text-[11px] text-zinc-400">Bunyi hitung mundur dan shutter kamera</span>
            </div>
            <input type="checkbox" v-model="audioEnabled" class="sr-only peer" />
            <div class="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 relative border border-zinc-700"></div>
          </label>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { settingsDB }       from '~/services/db'
import { useAuth }          from '~/composables/useAuth'
import { useTemplateStore } from '~/stores/template'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Pengaturan Acara — RD Photobooth' })

const auth          = useAuth()
const templateStore = useTemplateStore()

const eventName          = ref('')
const countdown          = ref(5)
const defaultShots       = ref(3)
const selectedTemplateId = ref('')
const autoPrint          = ref(false)
const audioEnabled       = ref(true)
const isSaving           = ref(false)
const saveFeedback       = ref('')

onMounted(async () => {
  await auth.loadPins()
  await templateStore.loadTemplates()

  if (templateStore.active?.id) {
    selectedTemplateId.value = templateStore.active.id
    defaultShots.value       = templateStore.active.totalSlots
  } else if (templateStore.templates.length > 0) {
    selectedTemplateId.value = templateStore.templates[0].id
    defaultShots.value       = templateStore.templates[0].totalSlots
  }

  const savedEvent     = (await settingsDB.get<string>('activeEventName'))
    || (typeof localStorage !== 'undefined' ? localStorage.getItem('photobooth_event_name') : null)
  const savedCd        = await settingsDB.get<number>('activeCountdown')
  const savedAutoPrint = await settingsDB.get<boolean>('autoPrintEnabled')
  const savedAudio     = await settingsDB.get<boolean>('audioFeedbackEnabled')

  if (savedEvent) eventName.value = savedEvent
  if (savedCd)    countdown.value = savedCd
  if (typeof savedAutoPrint === 'boolean') autoPrint.value    = savedAutoPrint
  if (typeof savedAudio === 'boolean')     audioEnabled.value = savedAudio
})

async function saveEventSettings() {
  isSaving.value     = true
  saveFeedback.value = ''

  try {
    const trimmedEvent = eventName.value.trim() || 'RD Photobooth'
    await settingsDB.set('activeEventName', trimmedEvent)
    if (typeof localStorage !== 'undefined') localStorage.setItem('photobooth_event_name', trimmedEvent)

    await settingsDB.set('activeCountdown', countdown.value)
    await settingsDB.set('autoPrintEnabled', autoPrint.value)
    await settingsDB.set('audioFeedbackEnabled', audioEnabled.value)

    if (selectedTemplateId.value) {
      await settingsDB.set('defaultTemplateId', selectedTemplateId.value)
      const tpl = templateStore.templates.find(t => t.id === selectedTemplateId.value)
      if (tpl) {
        templateStore.setActive(tpl)
        await settingsDB.set('lastTotalShots', tpl.totalSlots)
      }
    }

    // Sync to backend settings API
    await $fetch('/api/settings', {
      method: 'POST',
      body: {
        activeEventName:      trimmedEvent,
        activeCountdown:      countdown.value,
        autoPrintEnabled:     autoPrint.value,
        audioFeedbackEnabled: audioEnabled.value,
      },
    }).catch(() => { /* offline mode */ })

    saveFeedback.value = '✓ Konfigurasi acara berhasil disimpan'
    setTimeout(() => { saveFeedback.value = '' }, 3000)
  } finally {
    isSaving.value = false
  }
}
</script>
