<template>
  <!-- Layer list panel -->
  <div class="flex flex-col h-full overflow-hidden select-none">
    <div class="flex items-center justify-between px-3.5 py-3 border-b border-zinc-800 shrink-0">
      <span class="text-[10px] font-bold font-mono tracking-wider uppercase text-zinc-400">Lapisan ({{ elements.length }})</span>
      <div class="flex items-center gap-1">
        <button
          class="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 transition-colors"
          title="Tambah Foto"
          @click="$emit('add', 'photo')"
        >
          <Icon name="lucide:image" class="w-3.5 h-3.5" />
        </button>
        <button
          class="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 transition-colors"
          title="Tambah Teks"
          @click="$emit('add', 'text')"
        >
          <Icon name="lucide:type" class="w-3.5 h-3.5" />
        </button>
        <button
          class="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 transition-colors"
          title="Tambah Bentuk"
          @click="$emit('add', 'shape')"
        >
          <Icon name="lucide:square" class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto py-1.5 px-2 flex flex-col gap-1">
      <!-- Rendered bottom→top: last in array = top layer -->
      <div
        v-for="el in [...elements].reverse()"
        :key="el.id"
        class="flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer border transition-all group"
        :class="[
          selected === el.id
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-sm'
            : 'border-transparent hover:bg-zinc-800/60 text-zinc-300 hover:text-zinc-100',
          !el.visible && 'opacity-40',
          el.locked && 'text-zinc-500'
        ]"
        @click="$emit('select', el.id)"
      >
        <Icon :name="getLucideIcon(el.type)" class="w-3.5 h-3.5 shrink-0 text-zinc-400 group-hover:text-amber-400" />
        <span class="flex-1 text-xs font-semibold truncate">{{ el.name }}</span>

        <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" :class="selected === el.id && 'opacity-100'">
          <button
            class="p-1 rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
            :title="el.visible ? 'Sembunyikan' : 'Tampilkan'"
            @click.stop="$emit('toggle-visible', el.id)"
          >
            <Icon :name="el.visible ? 'lucide:eye' : 'lucide:eye-off'" class="w-3 h-3" />
          </button>
          <button
            class="p-1 rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
            :title="el.locked ? 'Buka Kunci' : 'Kunci'"
            @click.stop="$emit('toggle-lock', el.id)"
          >
            <Icon :name="el.locked ? 'lucide:lock' : 'lucide:unlock'" class="w-3 h-3" />
          </button>
        </div>
      </div>

      <div v-if="elements.length === 0" class="py-10 px-4 text-xs text-zinc-500 text-center flex flex-col items-center gap-2">
        <Icon name="lucide:layers" class="w-5 h-5 text-zinc-600" />
        <p>Belum ada elemen.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TemplateElement } from '~/types/template'

defineProps<{
  elements: TemplateElement[]
  selected: string | null
}>()

defineEmits<{
  select:           [id: string]
  add:              [type: string]
  'toggle-visible': [id: string]
  'toggle-lock':    [id: string]
}>()

function getLucideIcon(type: string): string {
  const map: Record<string, string> = {
    photo: 'lucide:image',
    text:  'lucide:type',
    image: 'lucide:file-image',
    shape: 'lucide:square',
  }
  return map[type] ?? 'lucide:box'
}
</script>
