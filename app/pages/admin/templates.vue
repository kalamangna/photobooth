<template>
  <div class="h-full select-none text-zinc-100">

    <!-- ── Role Restriction Alert for Operators ─────────────── -->
    <div v-if="!auth.isAdmin.value" class="max-w-xl mx-auto p-8 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col items-center text-center gap-4 shadow-xl my-8">
      <div class="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
        <Icon name="lucide:layout" class="w-7 h-7" />
      </div>
      <div class="flex flex-col gap-1">
        <h2 class="text-lg font-bold text-zinc-100">Kelola Template Khusus Admin</h2>
        <p class="text-xs text-zinc-400">
          Pengaturan tata letak dan desain bingkai foto hanya dapat diubah oleh akun Admin untuk menjaga konsistensi template saat event berlangsung.
        </p>
      </div>
      <NuxtLink
        to="/admin"
        class="px-5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all active:scale-95"
      >
        Kembali ke Dashboard
      </NuxtLink>
    </div>

    <!-- ── Template Editor Mode ──────────────────────────────────── -->
    <TemplateEditor
      v-else-if="templateStore.hasActive"
      :photos="demoPhotos"
      @back="templateStore.clearActive()"
      @exported="onExported"
    />

    <!-- ── Template Manager List View ────────────────────────────── -->
    <div v-else class="max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8 pb-12">

      <!-- Top Title Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">Kelola Template</h1>

        <button
          id="btn-new-template"
          class="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-2"
          @click="createNew"
        >
          <Icon name="lucide:plus" class="w-4 h-4 stroke-[3]" />
          <span>Template Baru</span>
        </button>
      </div>

      <!-- Filter Category Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 touch-pan-x">
        <button
          v-for="cat in categories"
          :key="cat.key"
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 min-h-[34px] border"
          :class="activeCategory === cat.key
            ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-sm'
            : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'"
          @click="activeCategory = cat.key"
        >
          <span>{{ cat.label }}</span>
          <span
            class="font-mono text-[10px] px-2 py-0.5 rounded-full"
            :class="activeCategory === cat.key ? 'bg-amber-400 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'"
          >
            {{ getCount(cat.key) }}
          </span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="templateStore.isLoading" class="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400 text-sm">
        <div class="w-8 h-8 border-4 border-zinc-700 border-t-amber-400 rounded-full animate-spin" />
        <p class="text-xs">Memuat template…</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredTemplates.length === 0" class="flex flex-col items-center justify-center py-24 text-center gap-3 bg-zinc-900/40 rounded-3xl border border-zinc-800/80">
        <div class="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-500">
          <Icon name="lucide:layout" class="w-7 h-7" />
        </div>
        <h2 class="text-base font-bold text-zinc-200">Belum Ada Template</h2>
        <p class="text-xs text-zinc-400 max-w-sm">
          Belum ada template pada kategori ini.
        </p>
      </div>

      <!-- Template Grid Cards -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        <div
          v-for="tpl in filteredTemplates"
          :key="tpl.id"
          class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-3.5 shadow-lg hover:border-zinc-700 transition-colors"
        >
          <!-- Top Tags -->
          <div class="flex items-center justify-between">
            <span class="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">
              {{ tpl.totalSlots }} FOTO
            </span>
            <span class="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
              {{ tpl.category }}
            </span>
          </div>

          <!-- Canvas Preview -->
          <div class="w-full flex items-center justify-center bg-zinc-950 rounded-2xl p-3 min-h-[170px] sm:min-h-[190px] overflow-hidden border border-zinc-800/80">
            <TemplateCanvasPreview
              :template="tpl"
              :photos="{}"
              :max-width="thumbW(tpl)"
              class="transition-transform duration-200 hover:scale-105"
            />
          </div>

          <!-- Info -->
          <div class="flex flex-col gap-0.5">
            <h3 class="text-sm font-bold text-zinc-100 truncate">{{ tpl.name }}</h3>
            <p class="text-xs text-zinc-400 line-clamp-1">{{ tpl.description || 'Tanpa deskripsi' }}</p>
            <span class="font-mono text-[10px] text-zinc-400 mt-1">{{ tpl.canvas.width }} × {{ tpl.canvas.height }} px · {{ tpl.canvas.dpi || 300 }} DPI</span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
            <button
              class="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 min-h-[36px]"
              @click="templateStore.setActive(tpl)"
            >
              <Icon name="lucide:edit-3" class="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            
            <button
              class="py-2 px-3 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all active:scale-95 min-h-[36px]"
              title="Duplikat"
              @click="duplicateTemplate(tpl)"
            >
              <Icon name="lucide:copy" class="w-3.5 h-3.5" />
            </button>

            <button
              v-if="!tpl.id.startsWith('preset-')"
              class="py-2 px-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-all active:scale-95 min-h-[36px]"
              title="Hapus"
              @click="confirmDelete(tpl)"
            >
              <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>

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
        v-if="templateToDelete"
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="templateToDelete = null"
      >
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-2xl">
          <div class="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Icon name="lucide:alert-triangle" class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-zinc-100">Hapus Template?</h3>
            <p class="text-xs text-zinc-400 mt-1">
              Template <span class="font-bold text-zinc-200">"{{ templateToDelete.name }}"</span> akan dihapus permanen.
            </p>
          </div>
          <div class="flex items-center gap-2 pt-2">
            <button
              class="flex-1 py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all active:scale-95"
              @click="templateToDelete = null"
            >
              Batal
            </button>
            <button
              class="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 text-xs font-bold transition-all active:scale-95 shadow-md shadow-rose-500/20"
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
import { useTemplateStore } from '~/stores/template'
import {
  makePhotoElement,
  makeTextElement,
  type PhotoTemplate,
} from '~/types/template'
import { useAuth } from '~/composables/useAuth'

definePageMeta({ layout: 'admin' })

useSeoMeta({
  title: 'RD Photobooth — Kelola Template',
  description: 'Kelola desain dan bingkai foto photobooth.',
})

const auth             = useAuth()
const templateStore    = useTemplateStore()
const activeCategory   = ref('all')
const templateToDelete = ref<PhotoTemplate | null>(null)

const categories = [
  { key: 'all',      label: 'Semua' },
  { key: 'strip',    label: 'Strip 2×6' },
  { key: 'grid',     label: 'Grid 4×6' },
  { key: 'polaroid', label: 'Polaroid' },
  { key: 'minimal',  label: 'Minimalis' },
]

// Demo photos for editor preview
const demoPhotos: Record<number, string> = {}

onMounted(() => templateStore.loadTemplates())

function getCount(key: string): number {
  if (key === 'all') return templateStore.templates.length
  return templateStore.templates.filter(t => t.category === key).length
}

const filteredTemplates = computed(() => {
  if (activeCategory.value === 'all') return templateStore.templates
  return templateStore.templates.filter(t => t.category === activeCategory.value)
})

function thumbW(tpl: PhotoTemplate): number {
  const ratio = tpl.canvas.width / tpl.canvas.height
  if (ratio < 0.6) return 85
  if (ratio > 1.2) return 180
  return 130
}

function createNew() {
  const id  = 'user-' + Date.now()
  const tpl: PhotoTemplate = {
    id,
    name:        'Template Baru',
    description: 'Template kustom',
    category:    'strip',
    totalSlots:  3,
    canvas: { width: 600, height: 1800, background: '#111111', dpi: 300 },
    elements: [
      makePhotoElement({ x: 32, y: 36,   width: 536, height: 480, slot: 0 }),
      makePhotoElement({ x: 32, y: 540,  width: 536, height: 480, slot: 1 }),
      makePhotoElement({ x: 32, y: 1044, width: 536, height: 480, slot: 2 }),
      makeTextElement({
        x: 32, y: 1600, width: 536, height: 50,
        text: 'RD Photobooth', fontSize: 32, fontWeight: '700',
        color: '#ffffff', textAlign: 'center', letterSpacing: 3,
      }),
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  templateStore.templates.push(tpl)
  templateStore.setActive(tpl)
}

function duplicateTemplate(tpl: PhotoTemplate) {
  const clone: PhotoTemplate = JSON.parse(JSON.stringify(tpl))
  clone.id = 'user-' + Date.now()
  clone.name = `${tpl.name} (Salinan)`
  clone.createdAt = new Date().toISOString()
  clone.updatedAt = new Date().toISOString()
  templateStore.templates.push(clone)
  templateStore.setActive(clone)
}

function confirmDelete(tpl: PhotoTemplate) {
  templateToDelete.value = tpl
}

async function executeDelete() {
  if (!templateToDelete.value) return
  await templateStore.deleteTemplate(templateToDelete.value.id)
  templateToDelete.value = null
}

function onExported(dataUrl: string) {
  console.log('Exported:', dataUrl.slice(0, 60))
}
</script>
