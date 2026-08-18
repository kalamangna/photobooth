<template>
  <div class="w-full h-full flex items-center justify-center bg-zinc-950 p-3 sm:p-6 overflow-hidden relative select-none">
    <!-- Ambient glow -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_110%,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />

    <Transition
      appear
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-4"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-2"
    >
      <div class="w-full max-w-5xl h-full max-h-[92vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative z-10">

        <!-- Header -->
        <header class="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800 shrink-0">
          <div class="flex items-center gap-3">
            <button
              class="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors active:scale-95 flex items-center justify-center min-h-[40px] min-w-[40px]"
              title="Kembali"
              @click="$emit('back')"
            >
              <Icon name="lucide:arrow-left" class="w-5 h-5" />
            </button>
            <h1 class="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">Pilih Template</h1>
          </div>
        </header>

        <!-- Category & Filter Tabs -->
        <div class="flex items-center gap-2 px-4 sm:px-6 py-3 border-b border-zinc-800 overflow-x-auto shrink-0 touch-pan-x">
          <button
            v-for="filter in availableFilters"
            :key="filter.key"
            class="px-4 py-2 rounded-full text-xs sm:text-sm font-bold border transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 min-h-[40px]"
            :class="activeCategory === filter.key
              ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
              : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'"
            @click="activeCategory = filter.key"
          >
            <span>{{ filter.label }}</span>
            <span
              class="font-mono text-[10px] sm:text-xs px-2 py-0.5 rounded-full"
              :class="activeCategory === filter.key ? 'bg-amber-400 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'"
            >
              {{ getCategoryCount(filter.key) }}
            </span>
          </button>
        </div>

        <!-- Templates Scroll Grid Area -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain">
          <div v-if="filteredTemplates.length === 0" class="flex flex-col items-center justify-center py-16 text-zinc-500 text-sm gap-3">
            <p>Tidak ada template dalam kategori ini.</p>
            <button
              class="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-semibold hover:bg-zinc-800"
              @click="activeCategory = 'all'"
            >
              Tampilkan Semua
            </button>
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
            <button
              v-for="tpl in filteredTemplates"
              :id="`tpl-${tpl.id}`"
              :key="tpl.id"
              class="flex flex-col p-3 sm:p-3.5 rounded-2xl border transition-all duration-150 relative bg-zinc-950/70 hover:bg-zinc-800/50 text-left group active:scale-[0.98] select-none"
              :class="selected === tpl.id
                ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_24px_rgba(245,158,11,0.2)]'
                : 'border-zinc-800/80 hover:border-zinc-700'"
              @click="selected = tpl.id"
            >
              <!-- Top tags -->
              <div class="w-full flex items-center justify-between mb-2">
                <span
                  class="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md uppercase"
                  :class="tpl.totalSlots === targetShots
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-zinc-800 text-zinc-400'"
                >
                  {{ tpl.totalSlots }} FOTO
                </span>

                <span v-if="tpl.totalSlots === targetShots" class="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                  <Icon name="lucide:star" class="w-3 h-3 fill-amber-400" />
                  <span>Cocok</span>
                </span>
                <span v-else class="font-mono text-[10px] text-zinc-400 uppercase">
                  {{ tpl.category }}
                </span>
              </div>

              <!-- Thumbnail Container -->
              <div class="w-full flex items-center justify-center bg-zinc-900/90 rounded-xl p-2.5 min-h-[160px] sm:min-h-[180px] overflow-hidden">
                <TemplateCanvasPreview
                  :template="tpl"
                  :photos="dummyPhotos"
                  :event-name="activeEventName"
                  :max-width="getThumbMaxWidth(tpl)"
                  class="transition-transform duration-200 group-hover:scale-105"
                />
              </div>

              <!-- Info -->
              <div class="w-full flex flex-col gap-0.5 mt-2.5">
                <h3 class="text-xs sm:text-sm font-bold text-zinc-100 truncate group-hover:text-amber-400 transition-colors">
                  {{ tpl.name }}
                </h3>
                <p class="text-[11px] text-zinc-400 line-clamp-1">
                  {{ tpl.description }}
                </p>
                <span class="font-mono text-[10px] text-zinc-400 mt-1">
                  {{ tpl.canvas.width }} × {{ tpl.canvas.height }} px
                </span>
              </div>

              <!-- Selected Checkmark indicator -->
              <div
                v-if="selected === tpl.id"
                class="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-amber-500 text-zinc-950 font-extrabold text-xs flex items-center justify-center shadow-lg shadow-amber-500/40"
              >
                <Icon name="lucide:check" class="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </button>
          </div>
        </div>

        <!-- Footer Action -->
        <footer class="flex items-center justify-between p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900 shrink-0 gap-3">
          <div class="flex items-center gap-3">
            <button
              class="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 text-xs sm:text-sm font-semibold transition-all active:scale-95 flex items-center gap-2 min-h-[44px]"
              @click="$emit('back')"
            >
              <Icon name="lucide:arrow-left" class="w-4 h-4" />
              <span>Kembali</span>
            </button>
            <span v-if="selectedTemplate" class="text-xs sm:text-sm text-zinc-400 hidden sm:inline">
              Dipilih: <strong class="text-zinc-100">{{ selectedTemplate.name }}</strong> ({{ selectedTemplate.totalSlots }} foto)
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              id="btn-use-template"
              class="px-7 py-3 sm:px-8 sm:py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-2 min-h-[48px]"
              :disabled="!selected"
              @click="confirm"
            >
              <span>Pilih</span>
              <Icon name="lucide:arrow-right" class="w-5 h-5" />
            </button>
          </div>
        </footer>

      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useTemplateStore } from '~/stores/template'
import { useSessionStore }  from '~/stores/session'
import { settingsDB }       from '~/services/db'
import { getDummyPhotos }   from '~/services/dummyPhotos'
import type { PhotoTemplate } from '~/types/template'
import TemplateCanvasPreview from '~/components/template/CanvasPreview.vue'

const props = defineProps<{
  shots?: number
}>()

const emit = defineEmits<{
  selected: [template: PhotoTemplate]
  skip:     []
  back:     []
}>()

const templateStore = useTemplateStore()
const sessionStore  = useSessionStore()

const dummyPhotos     = ref<Record<number, string>>({})
const templates       = computed(() => templateStore.templates)
const targetShots     = computed(() => props.shots || sessionStore.totalShots || 3)

const activeCategory  = ref<string>('matched')
const selected        = ref<string | null>(null)
const activeEventName = ref('')

// ─── Filter Tabs ───────────────────────────────────────────────
const availableFilters = computed(() => [
  { key: 'matched',  label: `Cocok (${targetShots.value} Foto)` },
  { key: 'all',      label: 'Semua Desain' },
  { key: 'strip',    label: 'Strip 2×6' },
  { key: 'grid',     label: 'Grid 4×6' },
  { key: 'polaroid', label: 'Polaroid' },
  { key: 'collage',  label: 'Kolase' },
])

function getCategoryCount(catKey: string): number {
  if (catKey === 'matched') {
    return templates.value.filter(t => t.totalSlots === targetShots.value).length
  }
  if (catKey === 'all') {
    return templates.value.length
  }
  return templates.value.filter(t => t.category === catKey).length
}

// ─── Filtered List ─────────────────────────────────────────────
const filteredTemplates = computed(() => {
  if (activeCategory.value === 'matched') {
    const matched = templates.value.filter(t => t.totalSlots === targetShots.value)
    return matched.length > 0 ? matched : templates.value
  }
  if (activeCategory.value === 'all') {
    return templates.value
  }
  return templates.value.filter(t => t.category === activeCategory.value)
})

const selectedTemplate = computed(() =>
  templates.value.find(t => t.id === selected.value) || null
)

onMounted(async () => {
  dummyPhotos.value = getDummyPhotos()
  await templateStore.loadTemplates()
  activeEventName.value = (await settingsDB.get<string>('activeEventName')) ?? ''

  const matched = templates.value.find(t => t.totalSlots === targetShots.value)
  if (matched) {
    selected.value = matched.id
    activeCategory.value = 'matched'
  } else if (templates.value.length > 0) {
    selected.value = templates.value[0].id
    activeCategory.value = 'all'
  }
})

function getThumbMaxWidth(tpl: PhotoTemplate): number {
  const ratio = tpl.canvas.width / tpl.canvas.height
  if (ratio < 0.6) return 85
  if (ratio > 1.2) return 180
  return 130
}

function confirm() {
  const tpl = selectedTemplate.value
  if (tpl) emit('selected', tpl)
}
</script>
