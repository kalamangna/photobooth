<template>
  <div class="w-full h-full flex flex-col overflow-hidden bg-zinc-950 text-zinc-100 select-none">
    <!-- Top bar -->
    <header class="flex items-center justify-between px-4 h-14 border-b border-zinc-800 bg-zinc-900 shrink-0">
      <div class="flex items-center gap-3">
        <button class="px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95" @click="$emit('back')">
          <Icon name="lucide:arrow-left" class="w-3.5 h-3.5" />
          <span>Kembali</span>
        </button>
        <div class="flex items-center">
          <input
            v-model="localName"
            class="bg-transparent border-b border-transparent focus:border-amber-500 text-zinc-100 font-bold text-sm outline-none px-1 py-0.5 min-w-[120px] transition-colors"
            @blur="templateStore.updateTemplateMeta({ name: localName })"
          />
        </div>
      </div>

      <div class="hidden sm:flex items-center">
        <span class="font-mono text-xs text-zinc-500">
          {{ template.canvas.width }} × {{ template.canvas.height }} px
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button id="btn-export" class="px-3.5 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95" @click="exportOutput">
          <Icon name="lucide:download" class="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
        <button id="btn-save-template" class="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95" @click="save">
          <Icon name="lucide:save" class="w-3.5 h-3.5" />
          <span>Simpan</span>
        </button>
      </div>
    </header>

    <div class="flex-1 grid grid-cols-[200px_1fr_250px] overflow-hidden">
      <!-- Left: Layer panel -->
      <aside class="bg-zinc-900/80 border-r border-zinc-800 overflow-hidden flex flex-col">
        <LayerPanel
          :elements="template.elements"
          :selected="templateStore.selected"
          @select="templateStore.selectElement"
          @add="handleAddElement"
          @toggle-visible="toggleVisible"
          @toggle-lock="toggleLock"
        />
      </aside>

      <!-- Center: Canvas -->
      <main class="flex-1 flex flex-col bg-zinc-950 relative overflow-hidden">
        <div
          ref="canvasWrapRef"
          class="flex-1 flex items-center justify-center p-6 overflow-auto"
          @click.self="templateStore.selectElement(null)"
        >
          <!-- The rendered canvas -->
          <div class="relative" :style="containerStyle">
            <CanvasPreview
              :template="template"
              :photos="photos"
              :max-width="canvasDisplayW"
              @rendered="onRendered"
            />

            <!-- Overlay: selection handles -->
            <template v-if="selectedEl && !selectedEl.locked">
              <div
                class="absolute border-2 border-amber-500 cursor-move pointer-events-auto"
                :style="selectionStyle"
                @mousedown="startDrag"
              >
                <div class="absolute -top-1.5 -left-1.5 w-3 h-3 bg-amber-400 border border-zinc-950 rounded-sm cursor-nwse-resize" @mousedown.stop="startResize('tl', $event)" />
                <div class="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-400 border border-zinc-950 rounded-sm cursor-nesw-resize" @mousedown.stop="startResize('tr', $event)" />
                <div class="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-amber-400 border border-zinc-950 rounded-sm cursor-nesw-resize" @mousedown.stop="startResize('bl', $event)" />
                <div class="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-amber-400 border border-zinc-950 rounded-sm cursor-nwse-resize" @mousedown.stop="startResize('br', $event)" />
                <div class="absolute -top-5 left-0 bg-amber-500 text-zinc-950 text-[10px] font-bold px-1.5 py-0.2 rounded-t whitespace-nowrap">
                  {{ selectedEl.name }}
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Layer actions for selected -->
        <div v-if="templateStore.selected" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 p-1.5 rounded-2xl shadow-xl backdrop-blur-md">
          <button class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium" @click="templateStore.moveLayer(templateStore.selected!, 'top')">↑↑ Atas</button>
          <button class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium" @click="templateStore.moveLayer(templateStore.selected!, 'up')">↑ Naik</button>
          <button class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium" @click="templateStore.moveLayer(templateStore.selected!, 'down')">↓ Turun</button>
          <button class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium" @click="templateStore.moveLayer(templateStore.selected!, 'bottom')">↓↓ Bawah</button>
        </div>
      </main>

      <!-- Right: Properties -->
      <aside class="bg-zinc-900/80 border-l border-zinc-800 overflow-hidden flex flex-col">
        <ElementProps
          :el="templateStore.selectedElement"
          @update="(id, updates) => templateStore.updateElement(id, updates)"
          @duplicate="templateStore.duplicateElement"
          @delete="templateStore.removeElement"
        />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateStore } from '~/stores/template'
import {
  makePhotoElement,
  makeTextElement,
  makeShapeElement,
  type TemplateElement,
} from '~/types/template'

const props = defineProps<{
  photos: Record<number, string>
}>()

const emit = defineEmits<{
  back:     []
  exported: [dataUrl: string]
}>()

const templateStore = useTemplateStore()
const template      = computed(() => templateStore.active!)
const localName     = ref(template.value?.name ?? '')

watch(() => template.value?.name, v => { if (v) localName.value = v })

// ─── Canvas display size ──────────────────────────────────────
const canvasWrapRef   = ref<HTMLDivElement | null>(null)
const canvasDisplayW  = ref(600)

onMounted(() => {
  if (canvasWrapRef.value) {
    const ro = new ResizeObserver(() => {
      canvasDisplayW.value = Math.min(
        canvasWrapRef.value!.clientWidth - 64,
        template.value.canvas.width,
      )
    })
    ro.observe(canvasWrapRef.value)
  }
})

const scale = computed(() =>
  canvasDisplayW.value / template.value.canvas.width
)

const containerStyle = computed(() => ({
  width:  canvasDisplayW.value + 'px',
  height: Math.round(template.value.canvas.height * scale.value) + 'px',
  position: 'relative' as const,
}))

// ─── Selected element overlay ─────────────────────────────────
const selectedEl = computed(() => templateStore.selectedElement)

const selectionStyle = computed(() => {
  if (!selectedEl.value) return {}
  const s   = scale.value
  const el  = selectedEl.value
  return {
    left:   (el.x * s) + 'px',
    top:    (el.y * s) + 'px',
    width:  (el.width  * s) + 'px',
    height: (el.height * s) + 'px',
    transform: `rotate(${el.rotation}deg)`,
  }
})

// ─── Drag to move ─────────────────────────────────────────────
let dragStart = { mx: 0, my: 0, ex: 0, ey: 0 }

function startDrag(e: MouseEvent) {
  if (!selectedEl.value || selectedEl.value.locked) return
  dragStart = { mx: e.clientX, my: e.clientY, ex: selectedEl.value.x, ey: selectedEl.value.y }
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup',   stopDrag)
}

function onDrag(e: MouseEvent) {
  if (!templateStore.selected) return
  const dx = (e.clientX - dragStart.mx) / scale.value
  const dy = (e.clientY - dragStart.my) / scale.value
  templateStore.updateElement(templateStore.selected, {
    x: Math.round(dragStart.ex + dx),
    y: Math.round(dragStart.ey + dy),
  })
}

function stopDrag() {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup',   stopDrag)
}

// ─── Resize handles ───────────────────────────────────────────
let resizeStart = { mx: 0, my: 0, ex: 0, ey: 0, ew: 0, eh: 0, corner: '' }

function startResize(corner: string, e: MouseEvent) {
  if (!selectedEl.value) return
  const el = selectedEl.value
  resizeStart = { mx: e.clientX, my: e.clientY, ex: el.x, ey: el.y, ew: el.width, eh: el.height, corner }
  window.addEventListener('mousemove', onResize)
  window.addEventListener('mouseup',   stopResize)
}

function onResize(e: MouseEvent) {
  if (!templateStore.selected) return
  const dx = (e.clientX - resizeStart.mx) / scale.value
  const dy = (e.clientY - resizeStart.my) / scale.value
  const { corner, ex, ey, ew, eh } = resizeStart
  let x = ex, y = ey, w = ew, h = eh
  if (corner.includes('r')) w = Math.max(20, ew + dx)
  if (corner.includes('l')) { x = ex + dx; w = Math.max(20, ew - dx) }
  if (corner.includes('b')) h = Math.max(20, eh + dy)
  if (corner.includes('t')) { y = ey + dy; h = Math.max(20, eh - dy) }
  templateStore.updateElement(templateStore.selected, {
    x: Math.round(x), y: Math.round(y),
    width: Math.round(w), height: Math.round(h),
  })
}

function stopResize() {
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup',   stopResize)
}

// ─── Add elements ─────────────────────────────────────────────
function handleAddElement(type: string) {
  const cx = Math.round(template.value.canvas.width  / 2)
  const cy = Math.round(template.value.canvas.height / 2)
  let el: TemplateElement
  if (type === 'photo') {
    el = makePhotoElement({ x: cx - 200, y: cy - 150, width: 400, height: 300, slot: 0 })
  } else if (type === 'text') {
    el = makeTextElement({ x: cx - 150, y: cy - 30, width: 300, height: 60, text: 'Teks baru' })
  } else {
    el = makeShapeElement({ x: cx - 100, y: cy - 2, width: 200, height: 4 })
  }
  templateStore.addElement(el)
}

// ─── Visibility & lock toggles ────────────────────────────────
function toggleVisible(id: string) {
  const el = template.value.elements.find(e => e.id === id)
  if (el) templateStore.updateElement(id, { visible: !el.visible })
}

function toggleLock(id: string) {
  const el = template.value.elements.find(e => e.id === id)
  if (el) templateStore.updateElement(id, { locked: !el.locked })
}

// ─── Rendered output ──────────────────────────────────────────
const lastDataUrl = ref('')
function onRendered(dataUrl: string) {
  lastDataUrl.value = dataUrl
}

// ─── Export ───────────────────────────────────────────────────
async function exportOutput() {
  if (!lastDataUrl.value) return
  const a    = document.createElement('a')
  a.href     = lastDataUrl.value
  a.download = `${template.value.name.replace(/\s+/g, '-')}-output.jpg`
  a.click()
  emit('exported', lastDataUrl.value)
}

// ─── Save ─────────────────────────────────────────────────────
async function save() {
  await templateStore.saveTemplate()
}
</script>
