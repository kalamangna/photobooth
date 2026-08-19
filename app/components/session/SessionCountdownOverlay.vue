<template>
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-150 ease-in"
    leave-to-class="opacity-0"
  >
    <div
      v-if="active"
      class="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/25 backdrop-blur-[1px] pointer-events-none"
    >
      <!-- Microcopy -->
      <p class="text-sm font-bold tracking-[0.2em] uppercase text-amber-300 drop-shadow">
        {{ shotMicrocopy }}
      </p>

      <!-- Ring + number -->
      <div class="relative flex items-center justify-center">
        <svg
          class="-rotate-90 w-[clamp(120px,20vmin,180px)] h-[clamp(120px,20vmin,180px)]"
          viewBox="0 0 120 120"
        >
          <circle
            class="stroke-white/10"
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke-width="5"
          />
          <circle
            class="stroke-amber-400 transition-[stroke-dashoffset] duration-1000 ease-linear"
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke-width="5"
            stroke-linecap="round"
            :stroke-dasharray="CIRCUMFERENCE"
            :stroke-dashoffset="ringOffset"
          />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <Transition
            enter-active-class="transition-all duration-150 ease-out"
            enter-from-class="opacity-0 scale-150"
            leave-active-class="transition-all duration-80 ease-in"
            leave-to-class="opacity-0 scale-75"
            mode="out-in"
          >
            <span
              v-if="countdownVal > 0"
              :key="countdownVal"
              class="font-mono font-black text-amber-400 leading-none select-none text-[clamp(2.5rem,8vmin,5rem)] [text-shadow:0_0_30px_rgba(245,158,11,0.8)]"
            >{{ countdownVal }}</span>
            <Icon
              v-else
              key="cam"
              name="lucide:camera"
              class="text-amber-400 w-[clamp(2rem,6vmin,3.5rem)] h-[clamp(2rem,6vmin,3.5rem)]"
            />
          </Transition>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  active: boolean
  countdownVal: number
  cdDuration: number
  shotMicrocopy: string
}>()

const CIRCUMFERENCE = 2 * Math.PI * 52

const ringOffset = computed(
  () => CIRCUMFERENCE * (1 - props.countdownVal / props.cdDuration),
)
</script>
