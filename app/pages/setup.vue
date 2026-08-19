<template>
  <div class="w-full h-[100dvh] flex flex-col bg-zinc-950 select-none p-4 sm:p-6 md:p-8 overflow-hidden touch-manipulation relative">

    <!-- Ambient glow -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_20%,rgba(245,158,11,0.06)_0%,transparent_70%)] pointer-events-none" />

    <!-- ── 1. Top Navigation & Header ───────────────────────── -->
    <header class="relative z-10 flex items-center justify-between gap-4 pb-3 shrink-0">
      <div class="flex items-center gap-3">
        <NuxtLink
          replace
          to="/"
          class="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors active:scale-95 flex items-center justify-center min-h-[40px] min-w-[40px]"
          title="Kembali ke Beranda"
        >
          <Icon name="lucide:arrow-left" class="w-5 h-5" />
        </NuxtLink>

        <div class="flex flex-col">
          <h1 class="text-lg sm:text-2xl font-black tracking-tight text-zinc-100 leading-tight">
            Pilih Template
          </h1>
        </div>
      </div>
    </header>

    <!-- ── 2. Split Screen Main Area ────────────────────────── -->
    <div class="relative z-10 flex-1 flex flex-col md:flex-row gap-4 sm:gap-6 min-h-0 overflow-hidden">

      <!-- Left Side: Template Selection & Filters -->
      <main class="flex-1 flex flex-col min-h-0 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-3 sm:p-4 overflow-hidden">
        
        <!-- Filter Jumlah Foto -->
        <div class="flex items-center gap-2 pb-3 shrink-0 overflow-x-auto touch-pan-x">
          <button
            v-for="f in availableShotsFilters"
            :key="f.value"
            type="button"
            class="py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all active:scale-95 whitespace-nowrap"
            :class="selectedShotsFilter === f.value
              ? 'bg-amber-500 text-zinc-950 font-black shadow-sm'
              : 'bg-zinc-850 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'"
            @click="setShotsFilter(f.value)"
          >
            {{ f.label }}
          </button>
        </div>

        <div v-if="templateStore.isLoading" class="flex flex-col items-center justify-center gap-3 text-zinc-500 my-auto">
          <div class="w-7 h-7 border-3 border-zinc-700 border-t-amber-400 rounded-full animate-spin" />
          <span class="text-xs">Memuat template…</span>
        </div>

        <!-- Template Grid -->
        <div
          v-else
          class="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 overflow-y-auto pr-1 h-full content-start"
        >
          <button
            v-for="tpl in filteredTemplates"
            :id="`tpl-select-${tpl.id}`"
            :key="tpl.id"
            type="button"
            class="relative flex flex-col p-3 rounded-2xl border transition-all duration-200 text-left group select-none overflow-hidden cursor-pointer active:scale-[0.98] min-w-0"
            :class="selectedTemplateId === tpl.id
              ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30 shadow-[0_0_24px_rgba(245,158,11,0.15)]'
              : 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 hover:bg-zinc-850'"
            @click="selectedTemplateId = tpl.id"
          >
            <!-- Active Checkmark Badge -->
            <div
              v-if="selectedTemplateId === tpl.id"
              class="absolute top-2.5 right-2.5 z-10 w-5 h-5 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-md shadow-amber-500/30"
            >
              <Icon name="lucide:check" class="w-3.5 h-3.5 stroke-[3]" />
            </div>

            <!-- Top Row: Badge Slots -->
            <div class="w-full flex items-center gap-1.5 mb-2 pr-6">
              <span
                class="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md uppercase shrink-0"
                :class="selectedTemplateId === tpl.id
                  ? 'bg-amber-500/25 text-amber-400 border border-amber-500/40'
                  : 'bg-zinc-800 text-zinc-400'"
              >
                {{ tpl.totalSlots }} Foto
              </span>
            </div>

            <!-- Thumbnail Container -->
            <div class="w-full h-28 sm:h-32 flex items-center justify-center bg-zinc-950 rounded-xl p-2 overflow-hidden border border-zinc-800/60 shadow-inner">
              <TemplateCanvasPreview
                :template="tpl"
                :photos="dummyPhotos"
                :max-width="85"
                :max-height="110"
                class="transition-transform duration-200 group-hover:scale-105"
              />
            </div>

            <!-- Template Name Only -->
            <div class="w-full flex flex-col mt-2.5 min-w-0">
              <span
                class="text-xs sm:text-sm font-bold truncate transition-colors"
                :class="selectedTemplateId === tpl.id ? 'text-amber-400' : 'text-zinc-200 group-hover:text-zinc-100'"
              >
                {{ tpl.name }}
              </span>
            </div>
          </button>
        </div>
      </main>

      <!-- Right Side: Dedicated Live Preview & Action Panel -->
      <aside
        v-if="selectedTemplate"
        class="w-full md:w-[340px] lg:w-[380px] shrink-0 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 flex flex-col justify-between items-center gap-3.5 shadow-xl overflow-hidden min-h-0"
      >
        <!-- Top Info Header (Consistent: Name & Slots) -->
        <div class="w-full flex items-center justify-between gap-2 shrink-0 pb-2 border-b border-zinc-800/80">
          <h2 class="text-sm sm:text-base font-bold text-zinc-100 truncate">
            {{ selectedTemplate.name }}
          </h2>
          <span class="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase shrink-0">
            {{ selectedTemplate.totalSlots }} Foto
          </span>
        </div>

        <!-- Large Canvas Preview Showcase (Visible on md and up) -->
        <div class="w-full flex-1 hidden md:flex items-center justify-center bg-zinc-950 rounded-2xl p-3 sm:p-4 overflow-hidden border border-zinc-800/80 min-h-0 shadow-inner">
          <TemplateCanvasPreview
            :template="selectedTemplate"
            :photos="dummyPhotos"
            :max-width="240"
            :max-height="320"
            class="shadow-2xl"
          />
        </div>

        <!-- Bottom Controls: Timer & Mulai Foto CTA -->
        <div class="w-full flex flex-col gap-3 shrink-0 pt-2 border-t border-zinc-800/80">
          <!-- Timer Picker -->
          <div class="w-full flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold">
              <Icon name="lucide:timer" class="w-4 h-4 text-amber-400" />
              <span>Timer:</span>
            </div>
            <div class="flex items-center bg-zinc-950 border border-zinc-800 p-1 rounded-xl">
              <button
                v-for="sec in [3, 5]"
                :key="sec"
                :id="`countdown-${sec}`"
                type="button"
                class="py-1 px-3 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center justify-center whitespace-nowrap"
                :class="countdownSec === sec
                  ? 'bg-amber-500 text-zinc-950 font-black shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'"
                @click="countdownSec = sec"
              >
                <span>{{ sec }} Detik</span>
              </button>
            </div>
          </div>

          <!-- Mulai Foto CTA -->
          <button
            id="btn-start-session-direct"
            class="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-bold text-sm sm:text-base transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(245,158,11,0.25)] min-h-[48px]"
            @click="proceed"
          >
            <span>Mulai Foto</span>
            <Icon name="lucide:camera" class="w-4 h-4" />
          </button>
        </div>
      </aside>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useSessionStore }  from '~/stores/session'
import { useTemplateStore } from '~/stores/template'
import { settingsDB }       from '~/services/db'
import { getDummyPhotos }   from '~/services/dummyPhotos'
import { PRESET_TEMPLATES } from '~/services/presets'
import type { PhotoTemplate } from '~/types/template'
import TemplateCanvasPreview from '~/components/template/CanvasPreview.vue'

definePageMeta({ layout: 'default', ssr: false })
useSeoMeta({ title: 'Pilih Template — RD Photobooth' })

const router        = useRouter()
const sessionStore  = useSessionStore()
const templateStore = useTemplateStore()

const dummyPhotos          = ref<Record<number, string>>(getDummyPhotos())
const selectedTemplateId   = ref<string>(templateStore.active?.id || PRESET_TEMPLATES[0]?.id || 'preset-strip-2x6-white')
const selectedShotsFilter  = ref<number | 'all'>('all')

const availableShotsFilters = computed(() => {
  const counts = Array.from(new Set(templateStore.templates.map(t => t.totalSlots))).sort((a, b) => a - b)
  return [
    { label: 'Semua', value: 'all' as const },
    ...counts.map(c => ({ label: `${c} Foto`, value: c })),
  ]
})

const filteredTemplates = computed(() => {
  if (selectedShotsFilter.value === 'all') return templateStore.templates
  return templateStore.templates.filter(t => t.totalSlots === selectedShotsFilter.value)
})

function setShotsFilter(filterVal: number | 'all') {
  selectedShotsFilter.value = filterVal
  const list = filteredTemplates.value
  if (list.length > 0 && !list.some(t => t.id === selectedTemplateId.value)) {
    selectedTemplateId.value = list[0].id
  }
}

const selectedTemplate = computed<PhotoTemplate>(() => {
  if (selectedTemplateId.value) {
    const found = templateStore.templates.find(t => t.id === selectedTemplateId.value)
    if (found) return found
  }
  return templateStore.active || templateStore.templates[0] || PRESET_TEMPLATES[0]
})

const countdownSec = computed({
  get: () => sessionStore.configuredCountdown || 5,
  set: (val: number) => {
    sessionStore.configuredCountdown = val
    settingsDB.set('activeCountdown', val).catch(() => {})
  },
})

let remoteCommandTimer: ReturnType<typeof setInterval> | null = null
let initialCmdVersion = 0
let initialCmdNonce   = ''

onMounted(async () => {
  dummyPhotos.value = getDummyPhotos()
  await templateStore.loadTemplates()

  // Default to saved default template, currently active template, or first template
  const savedTemplateId = await settingsDB.get<string>('defaultTemplateId')
  if (savedTemplateId && templateStore.templates.some(t => t.id === savedTemplateId)) {
    selectedTemplateId.value = savedTemplateId
  } else if (templateStore.active?.id && templateStore.templates.some(t => t.id === templateStore.active?.id)) {
    selectedTemplateId.value = templateStore.active.id
  } else if (templateStore.templates.length > 0) {
    selectedTemplateId.value = templateStore.templates[0].id
  } else if (PRESET_TEMPLATES.length > 0) {
    selectedTemplateId.value = PRESET_TEMPLATES[0].id
  }

  if (!sessionStore.configuredCountdown) {
    const savedCountdown = await settingsDB.get<number>('activeCountdown')
    if (savedCountdown && (savedCountdown === 3 || savedCountdown === 5)) {
      sessionStore.configuredCountdown = savedCountdown
    }
  }

  try {
    const initCmd = await $fetch<{ version?: number; nonce?: string }>('/api/kiosk/command').catch(() => null)
    initialCmdVersion = initCmd?.version ?? 0
    initialCmdNonce   = initCmd?.nonce ?? ''
  } catch { /* offline */ }

  remoteCommandTimer = setInterval(async () => {
    try {
      const cmd = await $fetch<{ action: string; version?: number; nonce?: string }>('/api/kiosk/command').catch(() => null)
      if (!cmd || cmd.action !== 'reset_home') return
      const isNewVersion = cmd.version !== undefined && cmd.version > initialCmdVersion
      const isNewNonce   = Boolean(cmd.nonce && cmd.nonce !== initialCmdNonce)
      if (isNewVersion || isNewNonce) {
        await sessionStore.resetSession()
        await router.replace('/')
      }
    } catch { /* offline */ }
  }, 1000)
})

onUnmounted(() => {
  if (remoteCommandTimer) {
    clearInterval(remoteCommandTimer)
    remoteCommandTimer = null
  }
})

async function proceed() {
  const tpl = selectedTemplate.value || templateStore.templates[0]
  if (tpl) {
    templateStore.setActive(tpl)
  }

  const shots = tpl ? tpl.totalSlots : 3
  sessionStore.configuredShots = shots

  if (sessionStore.current && sessionStore.sessionState === 'READY') {
    sessionStore.current.templateId = tpl ? tpl.id : undefined
    sessionStore.current.totalShots = shots
    sessionStore.current.currentShot = 0
    sessionStore.current.photos = Array.from({ length: shots }, (_, i) => ({
      index: i,
      dataUrl: null,
      capturedAt: null,
    }))
  } else {
    await sessionStore.startSession({ totalShots: shots, templateId: tpl ? tpl.id : undefined })
  }

  await router.push('/session')
}
</script>
