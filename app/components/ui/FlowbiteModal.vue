<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        tabindex="-1"
        aria-hidden="true"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto bg-zinc-950/80 backdrop-blur-sm"
        @click.self="handleBackdropClick"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <!-- Flowbite Modal Container -->
          <div
            class="relative w-full max-h-full my-auto"
            :class="sizeClasses"
          >
            <!-- Flowbite Modal Content -->
            <div class="relative bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-zinc-100">
              
              <!-- Flowbite Modal Header -->
              <div
                v-if="title || $slots.header"
                class="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 shrink-0"
              >
                <slot name="header">
                  <div class="flex items-center gap-3">
                    <div
                      v-if="icon"
                      class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      :class="iconBgClass || 'bg-amber-500/10 text-amber-400 border border-amber-500/30'"
                    >
                      <Icon :name="icon" class="w-5 h-5" />
                    </div>
                    <div>
                      <h3 class="text-base sm:text-lg font-bold text-zinc-100 leading-snug">
                        {{ title }}
                      </h3>
                      <p v-if="subtitle" class="text-xs text-zinc-400 mt-0.5">
                        {{ subtitle }}
                      </p>
                    </div>
                  </div>
                </slot>

                <button
                  v-if="showCloseButton"
                  type="button"
                  class="text-zinc-400 bg-transparent hover:bg-zinc-800 hover:text-zinc-100 rounded-xl text-sm w-9 h-9 ms-auto inline-flex justify-center items-center transition-colors focus:outline-none"
                  @click="close"
                >
                  <Icon name="lucide:x" class="w-4 h-4" />
                  <span class="sr-only">Tutup modal</span>
                </button>
              </div>

              <!-- Flowbite Modal Body -->
              <div
                class="p-4 sm:p-6 overflow-y-auto max-h-[calc(85vh-8rem)] flex flex-col gap-4"
                :class="bodyClass"
              >
                <slot />
              </div>

              <!-- Flowbite Modal Footer -->
              <div
                v-if="$slots.footer"
                class="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900/50 shrink-0"
              >
                <slot name="footer" />
              </div>

            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    subtitle?: string
    icon?: string
    iconBgClass?: string
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
    showCloseButton?: boolean
    dismissible?: boolean
    bodyClass?: string
  }>(),
  {
    title: '',
    subtitle: '',
    icon: '',
    iconBgClass: '',
    size: 'lg',
    showCloseButton: true,
    dismissible: true,
    bodyClass: '',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const sizeClasses = computed(() => {
  const map = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  }
  return map[props.size] || 'max-w-lg'
})

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function handleBackdropClick() {
  if (props.dismissible) {
    close()
  }
}
</script>
