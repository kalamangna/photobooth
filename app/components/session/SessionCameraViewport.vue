<template>
  <div
    class="relative flex-1 min-w-0 min-h-0 bg-black flex items-center justify-center p-3 sm:p-6 overflow-hidden"
  >
    <!-- Viewfinder matching active template photo slot -->
    <div
      v-show="showLiveCamera"
      class="relative max-w-full max-h-full flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-zinc-800 bg-zinc-950 transition-all duration-300 ease-out"
      :style="{
        aspectRatio: `${slotRatio}`,
        borderRadius: `${slotBorderRadius}px`,
      }"
    >
      <!-- Video + countdown overlay injected from parent -->
      <slot />

      <!-- Viewfinder framing corners -->
      <div class="absolute inset-0 pointer-events-none border border-white/10 rounded-[inherit]">
        <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/40 rounded-tl-sm" />
        <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-white/40 rounded-tr-sm" />
        <div class="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-white/40 rounded-bl-sm" />
        <div class="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/40 rounded-br-sm" />
      </div>

      <!-- Shot counter badge -->
      <div
        v-if="totalShots > 1"
        class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/15 rounded-full px-3 py-1 pointer-events-none shadow-md"
      >
        <span class="font-mono text-xs font-bold text-zinc-200">
          {{ currentShot + 1 }} / {{ totalShots }}
        </span>
      </div>
    </div>

    <!-- Result preview -->
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showResult"
        class="absolute inset-0 bg-zinc-950 flex items-center justify-center p-3"
      >
        <img
          v-if="outputUrl"
          :src="outputUrl"
          class="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          alt="Hasil foto"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  slotRatio: number
  slotBorderRadius: number
  showLiveCamera: boolean
  showResult: boolean
  outputUrl: string | null
  currentShot: number
  totalShots: number
}>()
</script>
