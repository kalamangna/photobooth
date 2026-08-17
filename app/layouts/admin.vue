<template>
  <div class="flex w-[100dvw] h-[100dvh] overflow-hidden bg-[#09090b] text-zinc-100 relative antialiased selection:bg-amber-500 selection:text-zinc-950">

    <!-- ── Sidebar ─────────────────────────────────────────── -->
    <aside
      class="flex flex-col w-60 shrink-0 h-[100dvh] bg-zinc-900 border-r border-zinc-800/80 z-30 transition-transform duration-200 ease-out select-none"
      :class="sidebarOpen ? 'translate-x-0 shadow-[8px_0_36px_rgba(0,0,0,0.6)]' : 'md:translate-x-0 max-md:-translate-x-full max-md:fixed max-md:inset-y-0 max-md:left-0'"
    >
      <!-- Brand & Active Role -->
      <div class="flex flex-col gap-2.5 px-4 pt-5 pb-4 border-b border-zinc-800/80 shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-sm">
              <Icon name="lucide:hexagon" class="w-4 h-4 text-amber-400" />
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold tracking-tight text-zinc-100 leading-tight">RD Photobooth</span>
              <span class="text-xs text-zinc-400">{{ auth.isAdmin.value ? 'Panel Admin' : 'Panel Operator' }}</span>
            </div>
          </div>
          <button class="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" @click="closeSidebar">
            <Icon name="lucide:x" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
        <!-- Dashboard (Admin & Operator) -->
        <NuxtLink
          to="/admin"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
          :class="route.path === '/admin'
            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm font-semibold'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70'"
          @click="closeSidebar"
        >
          <Icon name="lucide:layout-dashboard" class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
          <span>Dashboard</span>
        </NuxtLink>

        <!-- Galeri Sesi (Admin & Operator) -->
        <NuxtLink
          to="/gallery"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
          :class="route.path === '/gallery'
            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm font-semibold'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70'"
          @click="closeSidebar"
        >
          <Icon name="lucide:images" class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
          <span>Galeri Sesi</span>
        </NuxtLink>

        <!-- Admin Only Menus -->
        <template v-if="auth.isAdmin.value">
          <NuxtLink
            to="/admin/templates"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
            :class="route.path.startsWith('/admin/templates')
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70'"
            @click="closeSidebar"
          >
            <Icon name="lucide:layout" class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
            <span>Template</span>
          </NuxtLink>
        </template>

        <!-- Pengaturan (Admin & Operator) -->
        <NuxtLink
          to="/admin/settings"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
          :class="route.path.startsWith('/admin/settings')
            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm font-semibold'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70'"
          @click="closeSidebar"
        >
          <Icon name="lucide:settings-2" class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
          <span>Pengaturan</span>
        </NuxtLink>

      </nav>

      <!-- Footer: Lock -->
      <div class="p-3 border-t border-zinc-800/80 flex flex-col gap-1.5 shrink-0">
        <button
          class="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
          @click="lockAdmin"
        >
          <Icon name="lucide:lock" class="w-4 h-4 shrink-0 text-zinc-500" />
          <span>Kunci Layar</span>
        </button>
      </div>
    </aside>


    <!-- ── Mobile Sidebar Overlay ─────────────────────────── -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-20 bg-black/70 backdrop-blur-sm md:hidden"
        @click="closeSidebar"
      />
    </Transition>

    <!-- ── Main Workspace ──────────────────────────────────── -->
    <div class="flex-1 flex flex-col h-[100dvh] overflow-hidden bg-zinc-950">

      <!-- Top Mobile Header Bar -->
      <header class="md:hidden flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800/80 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Icon name="lucide:hexagon" class="w-4 h-4" />
          </div>
          <span class="text-sm font-bold text-zinc-100">RD Photobooth</span>
        </div>
        <button
          class="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-zinc-100"
          @click="sidebarOpen = !sidebarOpen"
        >
          <Icon name="lucide:menu" class="w-5 h-5" />
        </button>
      </header>

      <!-- Scrollable Main View -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>

    <!-- ── PIN Lock Overlay ────────────────────────────────── -->
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="!auth.isAuthenticated.value"
        class="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-md flex items-center justify-center p-6 select-none"
      >
        <!-- Ambient glow -->
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div
          class="relative z-10 w-full max-w-[320px] bg-zinc-900 border border-zinc-800 rounded-3xl p-7 flex flex-col items-center gap-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
          @click="pinInputRef?.focus()"
        >
          <!-- Header -->
          <div class="flex flex-col items-center gap-1.5 text-center">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-1">
              <Icon name="lucide:lock" class="w-5 h-5" />
            </div>
            <h1 class="text-xl font-bold text-zinc-100 tracking-tight">Masukkan PIN</h1>
          </div>

          <!-- Dots -->
          <div class="flex gap-3">
            <span
              v-for="i in 6"
              :key="i"
              class="w-3.5 h-3.5 rounded-full border-2 transition-all duration-150"
              :class="pinInput.length >= i
                ? 'bg-amber-400 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)] scale-110'
                : 'bg-zinc-950 border-zinc-700'"
            />
          </div>

          <!-- Hidden Input for keyboard typing -->
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

          <!-- Numpad -->
          <div class="grid grid-cols-3 gap-2.5 w-full">
            <button
              v-for="n in ['1','2','3','4','5','6','7','8','9','','0','⌫']"
              :key="n"
              class="aspect-[1.3] bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/60 rounded-2xl text-zinc-100 text-xl font-bold flex items-center justify-center transition-all active:scale-90 active:bg-amber-500/20 select-none"
              :class="n === '' ? 'invisible pointer-events-none' : ''"
              :disabled="n === ''"
              @click="onNumpad(n)"
            >
              <Icon v-if="n === '⌫'" name="lucide:delete" class="w-5 h-5 text-zinc-300" />
              <span v-else>{{ n }}</span>
            </button>
          </div>

          <!-- Error -->
          <p v-if="pinError" class="text-xs font-semibold text-rose-400 -mt-2">
            PIN tidak cocok. Coba lagi.
          </p>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const route       = useRoute()
const auth        = useAuth()
const pinInput    = ref('')
const pinError    = ref(false)
const pinInputRef = ref<HTMLInputElement | null>(null)
const sidebarOpen = ref(false)

onMounted(async () => {
  await auth.loadPins()

  if (!auth.isAuthenticated.value) {
    nextTick(() => pinInputRef.value?.focus())
  }
})

function closeSidebar() {
  sidebarOpen.value = false
}

function onNumpad(key: string) {
  if (key === '⌫') { pinInput.value = pinInput.value.slice(0, -1); pinError.value = false; return }
  if (key === '' || pinInput.value.length >= 6) return
  pinInput.value += key
  pinError.value = false
  if (pinInput.value.length === 6) checkPin()
}

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  pinInput.value = target.value.replace(/\D/g, '').slice(0, 6)
  pinError.value = false
  if (pinInput.value.length === 6) checkPin()
}

async function checkPin() {
  const role = await auth.verifyPin(pinInput.value)
  if (role) {
    pinError.value = false
    pinInput.value = ''
  } else {
    pinError.value = true
    pinInput.value = ''
  }
}

function lockAdmin() {
  auth.logout()
  pinInput.value = ''
  pinError.value = false
  sidebarOpen.value = false
  nextTick(() => pinInputRef.value?.focus())
}

function lockToSwitchRole() {
  auth.logout()
  pinInput.value = ''
  pinError.value = false
  sidebarOpen.value = false
  nextTick(() => pinInputRef.value?.focus())
}
</script>
