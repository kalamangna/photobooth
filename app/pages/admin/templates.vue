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
        <h2 class="text-xl font-bold text-zinc-100">Akses Terbatas</h2>
        <p class="text-xs sm:text-sm text-zinc-400 mt-1">Hanya Admin yang dapat mengelola template.</p>
      </div>
      <NuxtLink
        to="/admin"
        class="mt-2 text-zinc-950 bg-amber-500 hover:bg-amber-400 font-bold rounded-xl text-xs px-5 py-2.5 transition-all"
      >
        Kembali ke Dashboard
      </NuxtLink>
    </div>

    <!-- ── Template Grid Manager View ───────────────────────── -->
    <div v-else class="flex flex-col gap-6">

      <!-- Top Title Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-zinc-100">Template Frame</h1>
          <p class="text-xs sm:text-sm text-zinc-400">Kelola bingkai frame PNG untuk sesi foto</p>
        </div>

        <button
          type="button"
          @click="openUploadFrameModal()"
          class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Icon name="lucide:upload-cloud" class="w-4 h-4" />
          <span>Upload Frame PNG</span>
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
        <span class="text-xs">Memuat template…</span>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredTemplates.length === 0"
        class="py-20 px-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center gap-3"
      >
        <Icon name="lucide:layout" class="w-10 h-10 text-zinc-600" />
        <div>
          <p class="text-base font-bold text-zinc-200">Tidak Ada Template</p>
          <p class="text-xs text-zinc-400 mt-0.5">Belum ada template pada kategori ini.</p>
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
            <span
              v-if="tpl.id.startsWith('preset-')"
              class="px-2 py-0.5 rounded-md bg-zinc-800/90 border border-zinc-700/80 text-zinc-400 text-[10px] font-mono tracking-wider flex items-center gap-1"
            >
              <Icon name="lucide:lock" class="w-3 h-3 text-amber-400/80" />
              <span>Preset</span>
            </span>
            <span
              v-else
              class="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase font-mono tracking-wider"
            >
              Kustom
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
          <div class="flex flex-col gap-1">
            <h3 class="text-sm font-bold text-zinc-100 truncate" :title="tpl.name">{{ tpl.name }}</h3>
            <p class="text-[10px] text-zinc-500 font-mono">{{ tpl.canvas.width }} × {{ tpl.canvas.height }} px · {{ tpl.canvas.dpi || 300 }} DPI</p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 pt-2 border-t border-zinc-800">
            <!-- Jika Preset Bawaan: Tombol Duplikat (Tidak bisa diedit langsung) -->
            <button
              v-if="tpl.id.startsWith('preset-')"
              type="button"
              @click="duplicateTemplate(tpl)"
              class="flex-1 py-2 px-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-amber-400 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              title="Duplikat preset untuk kustomisasi"
            >
              <Icon name="lucide:copy" class="w-3.5 h-3.5 text-amber-400" />
              <span>Duplikat</span>
            </button>

            <!-- Jika Template Kustom User: Tombol Ganti Frame -->
            <template v-else>
              <button
                type="button"
                @click="openEditFrameModal(tpl)"
                class="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Icon name="lucide:file-image" class="w-3.5 h-3.5" />
                <span>Ganti Frame</span>
              </button>

              <button
                type="button"
                @click="duplicateTemplate(tpl)"
                class="p-2 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 transition-colors"
                title="Duplikat"
              >
                <Icon name="lucide:copy" class="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                @click="confirmDelete(tpl)"
                class="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                title="Hapus"
              >
                <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
              </button>
            </template>
          </div>
        </div>
      </div>

    </div>

    <!-- ── Flowbite Modal: Upload / Ganti Frame PNG ────────────── -->
    <FlowbiteModal
      v-model="showFrameModal"
      :title="editingTemplateId ? 'Ganti Frame PNG' : 'Upload Frame PNG'"
      icon="lucide:upload-cloud"
      size="lg"
    >
      <div class="flex flex-col gap-4">

        <!-- 1. Upload File Box -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-zinc-300">File Frame PNG</label>

          <!-- Dropzone State (No File) -->
          <div
            v-if="!frameDataUrl"
            class="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all duration-150"
            :class="isDragging
              ? 'border-amber-400 bg-amber-500/10'
              : 'border-zinc-700 hover:border-amber-500/60 bg-zinc-950/60 hover:bg-zinc-950'"
            @click="frameModalInputRef?.click()"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDropFrame"
          >
            <input
              ref="frameModalInputRef"
              type="file"
              accept="image/png,image/webp,image/jpeg"
              class="hidden"
              @change="onModalFrameFileSelected"
            />
            <Icon name="lucide:image-plus" class="w-7 h-7 text-amber-400" />
            <div>
              <p class="text-xs font-bold text-zinc-200">
                Pilih file frame PNG atau tarik ke sini
              </p>
              <p class="text-[11px] text-zinc-500 mt-0.5">PNG transparan (Canva / Photoshop)</p>
            </div>
          </div>

          <!-- Preview Loaded State -->
          <div
            v-else
            class="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between gap-3"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-12 h-14 rounded-lg bg-zinc-900 border border-zinc-800 p-1 flex items-center justify-center overflow-hidden shrink-0">
                <img :src="frameDataUrl" class="max-h-full max-w-full object-contain" alt="Frame" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-xs font-bold text-zinc-200 truncate">{{ frameFileName || 'Frame Overlay' }}</span>
                <span class="text-[10px] text-emerald-400 font-mono">✓ PNG Dimuat</span>
              </div>
            </div>

            <div class="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs text-amber-400 hover:text-amber-300 font-semibold bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                @click="frameModalInputRef?.click()"
              >
                Ganti
              </button>
              <button
                type="button"
                class="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Hapus"
                @click="frameDataUrl = ''; frameFileName = ''"
              >
                <Icon name="lucide:trash-2" class="w-4 h-4" />
              </button>
            </div>
            <input
              ref="frameModalInputRef"
              type="file"
              accept="image/png,image/webp,image/jpeg"
              class="hidden"
              @change="onModalFrameFileSelected"
            />
          </div>
        </div>

        <!-- 2. Format Layout (Hanya saat baru) -->
        <div v-if="!editingTemplateId" class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-zinc-300">Tata Letak Foto</label>
          <div class="p-3 rounded-xl border bg-amber-500/10 border-amber-500/40 text-amber-400 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <Icon name="lucide:layout-grid" class="w-4 h-4" />
              <span class="text-xs font-bold text-zinc-100">Strip (3 Foto Vertikal)</span>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-bold">3 Foto</span>
          </div>
        </div>

        <!-- 3. Nama Template -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-zinc-300">Nama Template</label>
          <input
            v-model="frameTemplateName"
            type="text"
            placeholder="Contoh: Sarah & Dimas Wedding"
            class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 focus:border-amber-500 outline-none transition-colors"
          />
        </div>

      </div>

      <!-- Footer Actions -->
      <template #footer>
        <button
          type="button"
          @click="showFrameModal = false"
          class="py-2 px-4 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all"
        >
          Batal
        </button>
        <button
          type="button"
          :disabled="!frameDataUrl"
          @click="saveFrameTemplate"
          class="py-2 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 text-xs font-bold shadow-md transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
        >
          <Icon name="lucide:check" class="w-4 h-4" />
          <span>{{ editingTemplateId ? 'Simpan' : 'Simpan Template' }}</span>
        </button>
      </template>
    </FlowbiteModal>

    <!-- ── Flowbite Modal: Delete Confirmation ────────────────── -->
    <FlowbiteModal
      :model-value="!!templateToDelete"
      title="Hapus Template?"
      icon="lucide:alert-triangle"
      icon-bg-class="bg-rose-500/10 text-rose-400 border border-rose-500/30"
      size="sm"
      @update:model-value="(v) => { if (!v) templateToDelete = null }"
    >
      <p class="text-xs text-zinc-400">
        Template <strong class="text-zinc-200">"{{ templateToDelete?.name }}"</strong> akan dihapus permanen.
      </p>

      <template #footer>
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
          Hapus
        </button>
      </template>
    </FlowbiteModal>

  </div>
</template>

<script setup lang="ts">
import { useTemplateStore } from '~/stores/template'
import { getDummyPhotos }   from '~/services/dummyPhotos'
import TemplateCanvasPreview from '~/components/template/CanvasPreview.vue'
import FlowbiteModal        from '~/components/ui/FlowbiteModal.vue'
import {
  makePhotoElement,
  makeImageElement,
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

// ─── Modal Upload / Edit Frame PNG ────────────────────────────
const showFrameModal        = ref(false)
const isDragging            = ref(false)
const editingTemplateId     = ref<string | null>(null)
const frameModalInputRef    = ref<HTMLInputElement | null>(null)
const frameDataUrl          = ref('')
const frameFileName         = ref('')
const frameTemplateName     = ref('')
const selectedLayout        = ref('strip-3')

const frameLayoutPresets = [
  { id: 'strip-3', name: 'Strip 2×6 (3 Foto)', slots: 3, size: '600 × 1800 px', category: 'strip' },
]

function openUploadFrameModal() {
  editingTemplateId.value = null
  frameDataUrl.value = ''
  frameFileName.value = ''
  frameTemplateName.value = 'Template Frame Baru'
  selectedLayout.value = 'strip-3'
  isDragging.value = false
  showFrameModal.value = true
}

function openEditFrameModal(tpl: PhotoTemplate) {
  editingTemplateId.value = tpl.id
  frameTemplateName.value = tpl.name
  isDragging.value = false

  // Cari image overlay jika ada
  const existingFrame = tpl.elements.find(el => el.type === 'image') as any
  if (existingFrame && existingFrame.src) {
    frameDataUrl.value = existingFrame.src
    frameFileName.value = existingFrame.name || 'Frame Aktif'
  } else {
    frameDataUrl.value = ''
    frameFileName.value = ''
  }

  showFrameModal.value = true
}

function onDropFrame(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  frameFileName.value = file.name
  if (!editingTemplateId.value) {
    frameTemplateName.value = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
  }
  const reader = new FileReader()
  reader.onload = (event) => {
    frameDataUrl.value = (event.target?.result as string) || ''
  }
  reader.readAsDataURL(file)
}

function onModalFrameFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  frameFileName.value = file.name
  if (!editingTemplateId.value) {
    frameTemplateName.value = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
  }
  const reader = new FileReader()
  reader.onload = (event) => {
    frameDataUrl.value = (event.target?.result as string) || ''
  }
  reader.readAsDataURL(file)
}

async function saveFrameTemplate() {
  if (!frameDataUrl.value) return

  // 1. Kasus Edit Template yang Sudah Ada
  if (editingTemplateId.value) {
    const existing = templateStore.templates.find(t => t.id === editingTemplateId.value)
    if (existing) {
      const updated: PhotoTemplate = JSON.parse(JSON.stringify(existing))
      updated.name = frameTemplateName.value || updated.name
      updated.updatedAt = new Date().toISOString()

      // Cari atau buat image frame overlay
      const imgIdx = updated.elements.findIndex(el => el.type === 'image')
      if (imgIdx !== -1) {
        updated.elements[imgIdx].src = frameDataUrl.value
      } else {
        updated.elements.push(
          makeImageElement({
            name: 'Frame Overlay',
            src: frameDataUrl.value,
            x: 0,
            y: 0,
            width: updated.canvas.width,
            height: updated.canvas.height,
            fit: 'cover',
            blendMode: 'normal',
            opacity: 1,
          })
        )
      }

      templateStore.setActive(updated)
      await templateStore.saveTemplate()
      templateStore.clearActive()
    }
    showFrameModal.value = false
    return
  }

  // 2. Kasus Buat Template Baru dari Frame PNG
  const layout = frameLayoutPresets.find(l => l.id === selectedLayout.value) || frameLayoutPresets[0]
  const id = 'user-' + Date.now()
  const canvasW = 600
  const canvasH = 1800
  const elements: any[] = [
    makePhotoElement({ x: 32, y: 36, width: 536, height: 480, slot: 0 }),
    makePhotoElement({ x: 32, y: 540, width: 536, height: 480, slot: 1 }),
    makePhotoElement({ x: 32, y: 1044, width: 536, height: 480, slot: 2 }),
  ]

  // Tambahkan Frame Overlay di lapisan atas
  elements.push(
    makeImageElement({
      name: 'Frame Overlay',
      src: frameDataUrl.value,
      x: 0,
      y: 0,
      width: canvasW,
      height: canvasH,
      fit: 'cover',
      blendMode: 'normal',
      opacity: 1,
    })
  )

  const tpl: PhotoTemplate = {
    id,
    name: frameTemplateName.value || 'Template Frame Custom',
    description: `Template bingkai dari ${frameFileName.value || 'PNG'}`,
    category: layout.category,
    totalSlots: layout.slots,
    canvas: { width: canvasW, height: canvasH, background: '#ffffff', dpi: 300 },
    elements,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  templateStore.setActive(tpl)
  await templateStore.saveTemplate()
  templateStore.clearActive()
  showFrameModal.value = false
}

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

function duplicateTemplate(tpl: PhotoTemplate) {
  const clone: PhotoTemplate = JSON.parse(JSON.stringify(tpl))
  clone.id = 'user-' + Date.now()
  clone.name = `${tpl.name} (Salinan)`
  clone.createdAt = new Date().toISOString()
  clone.updatedAt = new Date().toISOString()
  templateStore.templates.push(clone)
  templateStore.setActive(clone)
  templateStore.saveTemplate().then(() => templateStore.clearActive())
}

function confirmDelete(tpl: PhotoTemplate) {
  templateToDelete.value = tpl
}

async function executeDelete() {
  if (!templateToDelete.value) return
  await templateStore.deleteTemplate(templateToDelete.value.id)
  templateToDelete.value = null
}
</script>
