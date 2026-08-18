<template>
  <!-- Canvas preview — renders the template into a <canvas> element -->
  <div class="relative shrink-0 rounded-2xl overflow-hidden shadow-2xl" :style="wrapStyle">
    <canvas
      ref="canvasRef"
      class="block w-full h-full"
      :width="displayW"
      :height="displayH"
    />
    <div v-if="isRendering" class="absolute inset-0 bg-black/40 flex items-center justify-center">
      <div class="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PhotoTemplate } from '~/types/template'
import { renderTemplate } from '~/services/renderer'

const props = defineProps<{
  template: PhotoTemplate
  photos:   Record<number, string>
  /** Max width in pixels for display (canvas is scaled down) */
  maxWidth?: number
  /** Max height in pixels for display */
  maxHeight?: number
  /** Optional dynamic event title */
  eventName?: string
}>()

const emit = defineEmits<{
  rendered: [dataUrl: string]
}>()

const canvasRef    = ref<HTMLCanvasElement | null>(null)
const isRendering  = ref(false)

// ─── Compute display size ──────────────────────────────────────
const maxW    = computed(() => props.maxWidth ?? 480)
const maxH    = computed(() => props.maxHeight ?? 600)
const scale   = computed(() => {
  const scaleW = maxW.value / props.template.canvas.width
  const scaleH = maxH.value / props.template.canvas.height
  return Math.min(1, scaleW, scaleH)
})
const displayW = computed(() => Math.round(props.template.canvas.width  * scale.value))
const displayH = computed(() => Math.round(props.template.canvas.height * scale.value))

const wrapStyle = computed(() => ({
  width:  displayW.value + 'px',
  height: displayH.value + 'px',
}))

// ─── Render ───────────────────────────────────────────────────
async function render() {
  await nextTick()
  if (!canvasRef.value) return
  isRendering.value = true

  try {
    const result = await renderTemplate(props.template, {
      photos: props.photos,
      scale:  scale.value,
      eventName: props.eventName,
    })

    if (!canvasRef.value) return
    // Copy pixels to our canvas
    const ctx = canvasRef.value.getContext('2d')!
    ctx.clearRect(0, 0, displayW.value, displayH.value)
    ctx.drawImage(result.canvas, 0, 0)

    emit('rendered', result.dataUrl)
  } finally {
    isRendering.value = false
  }
}

onMounted(() => {
  render()
})

// Re-render when template, photos, maxWidth, maxHeight or eventName change
watch(
  () => [props.template, props.photos, props.maxWidth, props.maxHeight, props.eventName],
  () => render(),
  { deep: true },
)

// Expose render for parent to trigger manually
defineExpose({ render })
</script>
