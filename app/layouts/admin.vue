<template>
  <div class="w-[100dvw] h-[100dvh] flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden select-none relative">

    <!-- ── Admin Navigation Header ──────────────────────────────── -->
    <header class="shrink-0 border-b border-zinc-800 bg-zinc-900/90 z-20">
      <div class="flex items-center justify-between px-4 sm:px-6 h-14">
        
        <!-- Left: Brand & Operator Badge -->
        <div class="flex items-center gap-3">
          <NuxtLink to="/admin" class="flex items-center gap-2 text-zinc-100 hover:text-amber-400 transition-colors">
            <Icon name="lucide:hexagon" class="w-5 h-5 text-amber-500" />
            <span class="font-bold text-sm sm:text-base tracking-tight">RD Photobooth</span>
          </NuxtLink>
          <span class="font-mono text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full tracking-wider hidden sm:inline-block">
            OPERATOR
          </span>
        </div>

        <!-- Center: Navigation Tabs -->
        <nav class="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/80">
          <NuxtLink
            to="/admin"
            class="px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            :class="route.path === '/admin'
              ? 'bg-amber-500 text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'"
          >
            <Icon name="lucide:sliders" class="w-3.5 h-3.5" />
            <span class="hidden xs:inline">Kontrol</span>
          </NuxtLink>

          <NuxtLink
            to="/gallery"
            class="px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            :class="route.path === '/gallery'
              ? 'bg-amber-500 text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'"
          >
            <Icon name="lucide:image" class="w-3.5 h-3.5" />
            <span class="hidden xs:inline">Galeri</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/templates"
            class="px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            :class="route.path.startsWith('/admin/templates')
              ? 'bg-amber-500 text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'"
          >
            <Icon name="lucide:layout" class="w-3.5 h-3.5" />
            <span class="hidden xs:inline">Template</span>
          </NuxtLink>
        </nav>

        <!-- Right: Lock Session Button -->
        <div class="flex items-center gap-2">
          <button
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold transition-all active:scale-95 min-h-[36px]"
            title="Kunci sesi operator"
            @click="lockAdmin"
          >
            <Icon name="lucide:lock" class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Kunci</span>
          </button>
        </div>
      </div>
    </header>

    <!-- ── Admin Content: Slot is always mounted to satisfy Nuxt routing ── -->
    <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <slot />
    </main>

    <!-- ── PIN Lock Screen Overlay (When not authenticated) ───────────── -->
    <div
      v-if="!isAuthenticated"
      class="fixed inset-0 z-50 w-full h-full flex flex-col items-center justify-center p-6 sm:p-10 bg-zinc-950"
    >
      <!-- Background Ambient Glow -->
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div
        class="relative z-10 w-full max-w-xs flex flex-col items-center gap-5 sm:gap-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl cursor-default"
        @click="pinInputRef?.focus()"
      >
        <div class="flex flex-col items-center gap-1 text-center">
          <div class="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-1">
            <Icon name="lucide:lock" class="w-5 h-5" />
          </div>
          <span class="font-mono text-[10px] tracking-widest uppercase text-amber-500 font-bold">Akses Operator</span>
          <h1 class="text-xl sm:text-2xl font-black text-zinc-100">Masukkan PIN</h1>
        </div>

        <!-- 6-PIN Indicator Dots -->
        <div class="flex gap-3 my-1">
          <span
            v-for="i in 6"
            :key="i"
            class="w-3.5 h-3.5 rounded-full border-2 transition-all duration-150"
            :class="pinInput.length >= i
              ? 'bg-amber-400 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)] scale-110'
              : 'border-zinc-700 bg-zinc-950'"
          />
        </div>

        <!-- Hidden input for keyboard typing -->
        <input
          id="admin-pin-hidden-input"
          ref="pinInputRef"
          v-model="pinInput"
          type="password"
          inputmode="numeric"
          maxlength="6"
          class="sr-only"
          @keyup.enter="checkPin"
          @input="onInput"
        />

        <!-- Touch Numpad -->
        <div class="grid grid-cols-3 gap-2.5 w-full">
          <button
            v-for="n in ['1','2','3','4','5','6','7','8','9','','0','⌫']"
            :key="n"
            class="aspect-[1.3] bg-zinc-800 hover:bg-zinc-700/90 border border-zinc-700/50 rounded-2xl text-zinc-100 text-xl font-bold flex items-center justify-center transition-all active:scale-90 active:bg-amber-500/20 select-none disabled:opacity-0 disabled:pointer-events-none"
            :disabled="n === ''"
            @click="onNumpad(n)"
          >
            <Icon v-if="n === '⌫'" name="lucide:delete" class="w-5 h-5 text-zinc-300" />
            <span v-else>{{ n }}</span>
          </button>
        </div>

        <!-- Error Feedback -->
        <p v-if="pinError" class="text-xs text-rose-400 font-semibold -mt-2">PIN salah. Silakan coba lagi.</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { settingsDB } from '~/services/db'

const route           = useRoute()
const isAuthenticated = ref(false)
const pinInput        = ref('')
const pinError        = ref(false)
const currentPin      = ref('123456')
const pinInputRef     = ref<HTMLInputElement | null>(null)

onMounted(async () => {
  // Check session storage for existing auth
  if (typeof sessionStorage !== 'undefined') {
    const auth = sessionStorage.getItem('photobooth_admin_auth')
    if (auth === 'true') {
      isAuthenticated.value = true
    }
  }

  // Load configured PIN from settings
  const savedPin = await settingsDB.get<string>('adminPin')
  if (savedPin) currentPin.value = savedPin

  if (!isAuthenticated.value) {
    nextTick(() => pinInputRef.value?.focus())
  }
})

function onNumpad(key: string) {
  if (key === '⌫') {
    pinInput.value = pinInput.value.slice(0, -1)
    pinError.value = false
    return
  }
  if (key === '') return
  if (pinInput.value.length < 6) {
    pinInput.value += key
    pinError.value = false
  }
  if (pinInput.value.length === 6) {
    checkPin()
  }
}

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  pinInput.value = target.value.replace(/\D/g, '').slice(0, 6)
  pinError.value = false
  if (pinInput.value.length === 6) {
    checkPin()
  }
}

function checkPin() {
  if (pinInput.value === currentPin.value) {
    isAuthenticated.value = true
    pinError.value = false
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('photobooth_admin_auth', 'true')
    }
  } else {
    pinError.value = true
    pinInput.value = ''
  }
}

function lockAdmin() {
  isAuthenticated.value = false
  pinInput.value = ''
  pinError.value = false
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('photobooth_admin_auth')
  }
  nextTick(() => pinInputRef.value?.focus())
}
</script>
