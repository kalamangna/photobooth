<template>
  <!-- Layer list panel -->
  <div class="flex flex-col h-full overflow-hidden select-none">
    <div class="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-800 shrink-0">
      <span class="text-[11px] font-bold font-mono tracking-wider uppercase text-zinc-400">Layer</span>
      <div class="flex items-center gap-1">
        <button class="p-1 rounded-lg hover:bg-zinc-800 transition-colors text-sm" title="Tambah Foto"  @click="$emit('add', 'photo')">📷</button>
        <button class="p-1 rounded-lg hover:bg-zinc-800 transition-colors text-sm" title="Tambah Teks"  @click="$emit('add', 'text')">✍️</button>
        <button class="p-1 rounded-lg hover:bg-zinc-800 transition-colors text-sm" title="Tambah Shape" @click="$emit('add', 'shape')">⬜</button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto py-1">
      <!-- Rendered bottom→top: last in array = top layer -->
      <div
        v-for="el in [...elements].reverse()"
        :key="el.id"
        class="flex items-center gap-2 px-3.5 py-2 cursor-pointer border-l-2 transition-all group"
        :class="[
          selected === el.id
            ? 'bg-amber-500/15 border-amber-500 text-amber-400'
            : 'border-transparent hover:bg-zinc-850 text-zinc-300',
          !el.visible && 'opacity-40',
          el.locked && 'text-zinc-500'
        ]"
        @click="$emit('select', el.id)"
      >
        <span class="text-sm shrink-0">{{ typeIcon(el.type) }}</span>
        <span class="flex-1 text-xs truncate">{{ el.name }}</span>
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" :class="selected === el.id && 'opacity-100'">
          <button
            class="p-1 rounded hover:bg-zinc-800 text-xs"
            :title="el.visible ? 'Sembunyikan' : 'Tampilkan'"
            @click.stop="$emit('toggle-visible', el.id)"
          >{{ el.visible ? '👁' : '🙈' }}</button>
          <button
            class="p-1 rounded hover:bg-zinc-800 text-xs"
            :title="el.locked ? 'Buka kunci' : 'Kunci'"
            @click.stop="$emit('toggle-lock', el.id)"
          >{{ el.locked ? '🔒' : '🔓' }}</button>
        </div>
      </div>

      <div v-if="elements.length === 0" class="py-6 px-4 text-xs text-zinc-500 text-center">
        Belum ada elemen
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
  select:         [id: string]
  add:            [type: string]
  'toggle-visible': [id: string]
  'toggle-lock':    [id: string]
}>()

function typeIcon(type: string): string {
  const map: Record<string, string> = {
    photo: '📷', text: '✍️', image: '🖼', shape: '⬜',
  }
  return map[type] ?? '❓'
}
</script>
