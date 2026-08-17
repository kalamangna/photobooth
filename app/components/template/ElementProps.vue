<template>
  <div class="flex flex-col h-full overflow-y-auto select-none">
    <div v-if="!el" class="flex-1 flex items-center justify-center p-8 text-center text-zinc-500 text-xs">
      <p>Pilih elemen pada kanvas untuk mengubah properti.</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-center gap-2 p-3.5 border-b border-zinc-800 shrink-0">
        <span class="text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
          {{ typeName }}
        </span>
        <span class="text-xs font-bold text-zinc-200 truncate">{{ el.name }}</span>
      </div>

      <!-- Common: position & size -->
      <section class="p-3.5 border-b border-zinc-800 flex flex-col gap-2.5">
        <h3 class="text-[10px] font-bold font-mono tracking-wider uppercase text-zinc-400">Posisi & Ukuran</h3>
        <div class="grid grid-cols-2 gap-2">
          <label class="flex flex-col gap-1 text-[11px] font-medium text-zinc-400">
            <span>X</span>
            <input type="number" :value="el.x" class="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs outline-none focus:border-amber-500" @change="update('x', +($event.target as HTMLInputElement).value)" />
          </label>
          <label class="flex flex-col gap-1 text-[11px] font-medium text-zinc-400">
            <span>Y</span>
            <input type="number" :value="el.y" class="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs outline-none focus:border-amber-500" @change="update('y', +($event.target as HTMLInputElement).value)" />
          </label>
          <label class="flex flex-col gap-1 text-[11px] font-medium text-zinc-400">
            <span>Lebar</span>
            <input type="number" :value="el.width" class="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs outline-none focus:border-amber-500" @change="update('width', +($event.target as HTMLInputElement).value)" />
          </label>
          <label class="flex flex-col gap-1 text-[11px] font-medium text-zinc-400">
            <span>Tinggi</span>
            <input type="number" :value="el.height" class="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs outline-none focus:border-amber-500" @change="update('height', +($event.target as HTMLInputElement).value)" />
          </label>
          <label class="flex flex-col gap-1 text-[11px] font-medium text-zinc-400">
            <span>Rotasi (°)</span>
            <input type="number" :value="el.rotation" step="1" class="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs outline-none focus:border-amber-500" @change="update('rotation', +($event.target as HTMLInputElement).value)" />
          </label>
          <label class="flex flex-col gap-1 text-[11px] font-medium text-zinc-400">
            <span>Opasitas</span>
            <input type="range" min="0" max="1" step="0.01" :value="el.opacity" class="accent-amber-500 mt-2" @input="update('opacity', +($event.target as HTMLInputElement).value)" />
          </label>
        </div>
      </section>

      <!-- Photo-specific -->
      <template v-if="el.type === 'photo'">
        <section class="p-3.5 border-b border-zinc-800 flex flex-col gap-2.5">
          <h3 class="text-[10px] font-bold font-mono tracking-wider uppercase text-zinc-400">Foto</h3>
          <label class="flex flex-col gap-1 text-[11px] font-medium text-zinc-400">
            <span>Slot Foto</span>
            <select :value="el.slot" class="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs outline-none focus:border-amber-500" @change="update('slot', +($event.target as HTMLSelectElement).value)">
              <option v-for="i in 6" :key="i" :value="i - 1">Foto {{ i }}</option>
            </select>
          </label>
          <label class="flex flex-col gap-1 text-[11px] font-medium text-zinc-400">
            <span>Kesesuaian</span>
            <select :value="el.fit" class="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs outline-none focus:border-amber-500" @change="update('fit', ($event.target as HTMLSelectElement).value)">
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="fill">Fill</option>
            </select>
          </label>
          <label class="flex flex-col gap-1 text-[11px] font-medium text-zinc-400">
            <span>Radius Sudut</span>
            <input type="range" min="0" max="200" :value="el.borderRadius" class="accent-amber-500" @input="update('borderRadius', +($event.target as HTMLInputElement).value)" />
          </label>
          <div class="flex items-center gap-4 text-xs text-zinc-300 pt-1">
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" :checked="el.flipH" class="accent-amber-500" @change="update('flipH', ($event.target as HTMLInputElement).checked)" />
              Balik Horizontal
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" :checked="el.flipV" class="accent-amber-500" @change="update('flipV', ($event.target as HTMLInputElement).checked)" />
              Balik Vertikal
            </label>
          </div>
        </section>
      </template>

      <!-- Text-specific -->
      <template v-if="el.type === 'text'">
        <section class="p-3.5 border-b border-zinc-800 flex flex-col gap-2.5">
          <h3 class="text-[10px] font-bold font-mono tracking-wider uppercase text-zinc-400">Teks</h3>
          <label class="flex flex-col gap-1 text-[11px] font-medium text-zinc-400">
            <span>Isi Teks</span>
            <textarea
              :value="el.text"
              rows="2"
              class="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs outline-none focus:border-amber-500"
              @input="update('text', ($event.target as HTMLTextAreaElement).value)"
            />
          </label>
          <label class="flex flex-col gap-1 text-[11px] font-medium text-zinc-400">
            <span>Font</span>
            <select :value="el.fontFamily" class="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs outline-none focus:border-amber-500" @change="update('fontFamily', ($event.target as HTMLSelectElement).value)">
              <option value="Inter">Inter</option>
              <option value="Georgia">Georgia</option>
              <option value="Playfair Display">Playfair Display</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Dancing Script">Dancing Script</option>
              <option value="monospace">Monospace</option>
            </select>
          </label>
          <div class="grid grid-cols-2 gap-2">
            <label class="flex flex-col gap-1 text-[11px] font-medium text-zinc-400">
              <span>Ukuran</span>
              <input type="number" :value="el.fontSize" min="8" max="400" class="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs outline-none focus:border-amber-500" @change="update('fontSize', +($event.target as HTMLInputElement).value)" />
            </label>
            <label class="flex flex-col gap-1 text-[11px] font-medium text-zinc-400">
              <span>Warna</span>
              <input type="color" :value="colorToHex(el.color)" class="w-full h-8 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer" @input="update('color', ($event.target as HTMLInputElement).value)" />
            </label>
            <label class="flex flex-col gap-1 text-[11px] font-medium text-zinc-400">
              <span>Ketebalan</span>
              <select :value="el.fontWeight" class="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs outline-none focus:border-amber-500" @change="update('fontWeight', ($event.target as HTMLSelectElement).value)">
                <option value="300">Tipis</option>
                <option value="400">Reguler</option>
                <option value="600">Semibold</option>
                <option value="700">Tebal</option>
                <option value="800">Ekstra Tebal</option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-[11px] font-medium text-zinc-400">
              <span>Perataan</span>
              <select :value="el.textAlign" class="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs outline-none focus:border-amber-500" @change="update('textAlign', ($event.target as HTMLSelectElement).value)">
                <option value="left">Kiri</option>
                <option value="center">Tengah</option>
                <option value="right">Kanan</option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-[11px] font-medium text-zinc-400 col-span-2">
              <span>Spasi Huruf</span>
              <input type="number" :value="el.letterSpacing" step="0.5" class="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs outline-none focus:border-amber-500" @change="update('letterSpacing', +($event.target as HTMLInputElement).value)" />
            </label>
          </div>
        </section>
      </template>

      <!-- Shape-specific -->
      <template v-if="el.type === 'shape'">
        <section class="p-3.5 border-b border-zinc-800 flex flex-col gap-2.5">
          <h3 class="text-[10px] font-bold font-mono tracking-wider uppercase text-zinc-400">Bentuk</h3>
          <label class="flex flex-col gap-1 text-[11px] font-medium text-zinc-400">
            <span>Bentuk</span>
            <select :value="el.shape" class="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs outline-none focus:border-amber-500" @change="update('shape', ($event.target as HTMLSelectElement).value)">
              <option value="rect">Persegi</option>
              <option value="ellipse">Elips</option>
              <option value="line">Garis</option>
            </select>
          </label>
          <div class="grid grid-cols-2 gap-2">
            <label class="flex flex-col gap-1 text-[11px] font-medium text-zinc-400">
              <span>Warna</span>
              <input type="color" :value="colorToHex(el.fill)" class="w-full h-8 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer" @input="update('fill', ($event.target as HTMLInputElement).value)" />
            </label>
            <label class="flex flex-col gap-1 text-[11px] font-medium text-zinc-400">
              <span>Radius Sudut</span>
              <input type="number" :value="el.borderRadius" min="0" class="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs outline-none focus:border-amber-500" @change="update('borderRadius', +($event.target as HTMLInputElement).value)" />
            </label>
          </div>
        </section>
      </template>

      <!-- Visibility & lock -->
      <section class="p-3.5 border-b border-zinc-800">
        <div class="flex items-center gap-4 text-xs text-zinc-300">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" :checked="el.visible" class="accent-amber-500" @change="update('visible', ($event.target as HTMLInputElement).checked)" />
            Tampilkan
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" :checked="el.locked" class="accent-amber-500" @change="update('locked', ($event.target as HTMLInputElement).checked)" />
            Kunci
          </label>
        </div>
      </section>

      <!-- Actions -->
      <section class="p-3.5 flex items-center gap-2">
        <button class="flex-1 py-2 px-3 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5" @click="$emit('duplicate', el.id)">
          <Icon name="lucide:copy" class="w-3.5 h-3.5" />
          <span>Duplikat</span>
        </button>
        <button class="py-2 px-3 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5" @click="$emit('delete', el.id)">
          <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
          <span>Hapus</span>
        </button>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { TemplateElement } from '~/types/template'

const props = defineProps<{
  el: TemplateElement | null
}>()

const emit = defineEmits<{
  update:    [id: string, updates: Partial<TemplateElement>]
  duplicate: [id: string]
  delete:    [id: string]
}>()

const typeName = computed(() => {
  const map: Record<string, string> = {
    photo: '📷 Foto', text: '✍️ Teks', image: '🖼 Gambar', shape: '⬜ Bentuk',
  }
  return props.el ? (map[props.el.type] ?? props.el.type) : ''
})

function update(key: string, value: unknown) {
  if (!props.el) return
  emit('update', props.el.id, { [key]: value } as Partial<TemplateElement>)
}

function colorToHex(color: string): string {
  if (!color || color.startsWith('#')) return color || '#000000'
  const canvas = document.createElement('canvas')
  const ctx    = canvas.getContext('2d')!
  ctx.fillStyle = color
  return ctx.fillStyle
}
</script>
