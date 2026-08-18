<template>
  <div class="max-w-7xl mx-auto flex flex-col gap-6">

    <!-- ── Role Restriction Alert for Operators ─────────────── -->
    <div
      v-if="!auth.isAdmin.value"
      class="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col items-center text-center gap-4 my-8 max-w-xl mx-auto shadow-xl"
    >
      <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
        <Icon name="lucide:layout" class="w-6 h-6" />
      </div>
      <div>
        <h2 class="text-xl font-bold text-zinc-100">Khusus Akun Admin</h2>
        <p class="text-xs sm:text-sm text-zinc-400 mt-1">Hanya akun Admin yang dapat mengelola tata letak dan desain template.</p>
      </div>
      <NuxtLink
        to="/admin"
        class="mt-2 text-zinc-950 bg-amber-500 hover:bg-amber-400 font-bold rounded-xl text-xs px-5 py-2.5 transition-all"
      >
        Kembali ke Dashboard
      </NuxtLink>
    </div>

    <!-- ── Template Editor Mode ─────────────────────────────── -->
    <TemplateEditor
      v-else-if="templateStore.hasActive"
      :photos="demoPhotos"
      @back="templateStore.clearActive()"
      @exported="onExported"
    />

    <!-- ── Template Grid Manager View ───────────────────────── -->
    <div v-else class="flex flex-col gap-6">

      <!-- Top Title Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-zinc-100">Kelola Template</h1>
          <p class="text-xs sm:text-sm text-zinc-400">Tata letak bingkai foto dan preset cetak</p>
        </div>

        <button
          type="button"
          @click="createNew"
          class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Icon name="lucide:plus" class="w-4 h-4" />
          <span>Template Baru</span>
        </button>
      </div>

      <!-- Filter Category Tabs -->
      <div class="flex items-center gap-1.5 border-b border-zinc-800 pb-1 overflow-x-auto">
        <button
          v-for="cat in categories"
          :key="cat.key"
          type="button"
          class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2"
          :class="activeCategory === cat.key
            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            : 'text-zinc-400 hover:text-zinc-200'"
          @click="activeCategory = cat.key"
        >
          <span>{{ cat.label }}</span>
          <span
            class="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
            :class="activeCategory === cat.key ? 'bg-amber-500/20 text-amber-300' : 'bg-zinc-800 text-zinc-500'"
          >
            {{ getCount(cat.key) }}
          </span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="templateStore.isLoading" class="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-amber-400" />
        <span class="text-xs">Memuat koleksi template…</span>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredTemplates.length === 0"
        class="py-20 px-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center gap-3"
      >
        <Icon name="lucide:layout" class="w-10 h-10 text-zinc-600" />
        <div>
          <p class="text-base font-bold text-zinc-200">Tidak Ada Template</p>
          <p class="text-xs text-zinc-400 mt-0.5">Tidak ditemukan template pada kategori yang dipilih.</p>
        </div>
      </div>

      <!-- Template Cards Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <div
          v-for="tpl in filteredTemplates"
          :key="tpl.id"
          class="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between gap-4 shadow-lg hover:border-zinc-700 transition-colors group"
        >
          <!-- Card Header Badges -->
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-bold">
              {{ tpl.totalSlots }} FOTO
            </span>
            <span class="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 text-[10px] uppercase font-mono tracking-wider">
              {{ tpl.category }}
            </span>
          </div>

          <!-- Canvas Preview -->
          <div class="w-full aspect-[3/4] bg-zinc-950 rounded-xl flex items-center justify-center p-3 border border-zinc-800 overflow-hidden shadow-inner">
            <TemplateCanvasPreview
              :template="tpl"
              :photos="demoPhotos"
              :max-width="thumbW(tpl)"
              class="transition-transform duration-200 group-hover:scale-105"
            />
          </div>

          <!-- Info -->
          <div class="flex flex-col gap-0.5">
            <h3 class="text-sm font-bold text-zinc-100 truncate" :title="tpl.name">{{ tpl.name }}</h3>
            <p class="text-xs text-zinc-400 truncate">{{ tpl.description || 'Template photobooth' }}</p>
            <p class="text-[10px] text-zinc-500 font-mono mt-1">{{ tpl.canvas.width }} × {{ tpl.canvas.height }} px · {{ tpl.canvas.dpi || 300 }} DPI</p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              @click="templateStore.setActive(tpl)"
              class="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Icon name="lucide:edit-3" class="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              @click="duplicateTemplate(tpl)"
              class="p-2 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 transition-colors"
              title="Duplikat Template"
            >
              <Icon name="lucide:copy" class="w-3.5 h-3.5" />
            </button>

            <button
              v-if="!tpl.id.startsWith('preset-')"
              type="button"
              @click="confirmDelete(tpl)"
              class="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
              title="Hapus Template"
            >
              <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Delete Confirmation Dialog -->
    <div
      v-if="templateToDelete"
      class="fixed inset-0 z-60 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm"
      @click.self="templateToDelete = null"
    >
      <div class="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
        <div class="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <Icon name="lucide:alert-triangle" class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-base font-bold text-zinc-100">Hapus Template?</h3>
          <p class="text-xs text-zinc-400 mt-1">
            Template <strong class="text-zinc-200">"{{ templateToDelete.name }}"</strong> akan dihapus permanen.
          </p>
        </div>
        <div class="flex items-center gap-2 pt-2">
          <button
            type="button"
            @click="templateToDelete = null"
            class="flex-1 py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            @click="executeDelete"
            class="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 text-xs font-bold transition-all"
          >
            Hapus Template
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useTemplateStore } from '~/stores/template'
import { getDummyPhotos }   from '~/services/dummyPhotos'
import {
  makePhotoElement,
  makeTextElement,
  type PhotoTemplate,
} from '~/types/template'
import { useAuth } from '~/composables/useAuth'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Kelola Template — RD Photobooth' })

const auth             = useAuth()
const templateStore    = useTemplateStore()
const activeCategory   = ref('all')
const templateToDelete = ref<PhotoTemplate | null>(null)
const categoryLabels: Record<string, string> = {
  strip:    'Strip 2×6',
  grid:     'Grid 4×6',
  polaroid: 'Polaroid',
  minimal:  'Minimalis',
}

const categories = computed(() => {
  const list = [{ key: 'all', label: 'Semua' }]
  const presentKeys = new Set(templateStore.templates.map(t => t.category).filter(Boolean))

  presentKeys.forEach(cat => {
    list.push({
      key: cat,
      label: categoryLabels[cat] || (cat.charAt(0).toUpperCase() + cat.slice(1)),
    })
  })

  return list
})

const demoPhotos = ref<Record<number, string>>({})

onMounted(() => {
  demoPhotos.value = getDummyPhotos()
  templateStore.loadTemplates()
})

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
