<template>
  <div
    class="flex shrink-0 bg-zinc-900 overflow-y-auto"
    :class="
      isLandscape
        ? 'flex-col w-[clamp(260px,28vw,340px)] h-full border-l border-zinc-800 p-5 gap-4 items-stretch'
        : sessionState === 'DONE'
          ? 'flex-col w-full border-t border-zinc-800 p-4 sm:p-5 gap-3 items-stretch max-h-[58dvh]'
          : 'flex-row w-full border-t border-zinc-800 px-5 py-3 gap-4 items-center max-h-[30dvh] min-h-[110px]'
    "
  >
    <!-- Shot thumbnails -->
    <div
      v-if="totalShots > 1"
      class="flex gap-2 items-center shrink-0"
      :class="isLandscape ? 'flex-row flex-wrap justify-center' : 'flex-col'"
    >
      <button
        v-for="(photo, i) in photos"
        :key="i"
        type="button"
        class="w-12 h-14 rounded-[10px] border overflow-hidden flex items-center justify-center bg-black shrink-0 transition-all duration-200 relative"
        :class="{
          'border-emerald-500 hover:border-amber-400 cursor-pointer active:scale-95 shadow-sm':
            photo.dataUrl !== null && sessionState === 'READY',
          'border-amber-400 ring-2 ring-amber-400/30':
            photo.dataUrl === null && currentShot === i && sessionState !== 'PREVIEW' && sessionState !== 'DONE' && sessionState !== 'PRINT',
          'border-zinc-800 opacity-60':
            photo.dataUrl === null &&
            (currentShot !== i || sessionState === 'PREVIEW' || sessionState === 'DONE' || sessionState === 'PRINT'),
        }"
        :title="
          photo.dataUrl && sessionState === 'READY'
            ? `Klik untuk foto ulang jepretan ${i + 1}`
            : `Foto ke-${i + 1}`
        "
        @click="photo.dataUrl && sessionState === 'READY' ? $emit('retakeShot', i) : null"
      >
        <img v-if="photo.dataUrl" :src="photo.dataUrl" class="w-full h-full object-cover" alt="" />
        <span v-else class="text-xs font-mono font-bold text-zinc-600">{{ i + 1 }}</span>
      </button>
    </div>

    <!-- Actions -->
    <div class="flex flex-col gap-2.5 flex-1 min-w-0">

      <!-- READY -->
      <template v-if="sessionState === 'READY'">
        <p class="text-xs font-semibold text-zinc-400 text-center">{{ shotHeadline }}</p>
        <button
          id="btn-capture"
          class="w-full min-h-[52px] px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.97] text-zinc-950 font-bold text-base flex items-center justify-center gap-2.5 shadow-[0_4px_24px_rgba(245,158,11,0.25)] transition-all"
          @click="$emit('capture')"
        >
          <Icon name="lucide:camera" class="w-5 h-5 shrink-0" />
          {{ currentShot === 0 ? 'Mulai Foto' : 'Foto Berikutnya' }}
        </button>
        <button
          v-if="currentShot > 0"
          class="flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
          @click="$emit('retakeShot')"
        >
          <Icon name="lucide:rotate-ccw" class="w-3.5 h-3.5" />
          Foto Ulang Jepretan Ini
        </button>
      </template>

      <!-- COUNTDOWN -->
      <template v-if="sessionState === 'COUNTDOWN'">
        <p class="text-sm text-zinc-400 text-center animate-pulse">Bersiap…</p>
      </template>

      <!-- PREVIEW -->
      <template v-if="sessionState === 'PREVIEW'">
        <p class="text-sm font-bold text-zinc-100 text-center">Hasil Foto</p>

        <button
          class="w-full mt-2 py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.97] text-zinc-950 text-base font-bold transition-all flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(245,158,11,0.25)] min-h-[52px]"
          @click="$emit('finish')"
        >
          <span>Selesai</span>
          <Icon name="lucide:check" class="w-5 h-5" />
        </button>

        <div class="flex items-center justify-center gap-2 pt-1">
          <button
            class="flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
            @click="$emit('retakeAll')"
          >
            <Icon name="lucide:rotate-ccw" class="w-3.5 h-3.5" />
            Foto Ulang Semua
          </button>
        </div>
      </template>

      <!-- DONE -->
      <template v-if="sessionState === 'DONE'">
        <slot name="done" />
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  sessionState: string
  currentShot: number
  totalShots: number
  photos: Array<{ index: number; dataUrl: string | null; capturedAt: string | null }>
  isLandscape: boolean
  shotHeadline: string
}>()

defineEmits<{
  capture: []
  retakeShot: [index?: number]
  finish: []
  retakeAll: []
}>()
</script>
