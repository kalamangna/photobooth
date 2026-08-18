<template>
  <div class="antialiased bg-zinc-950 w-full h-screen text-zinc-100 flex flex-col font-sans overflow-hidden">
    
    <!-- ── Top Navbar (Fixed 64px) ────────────────────────────── -->
    <header class="bg-zinc-900 border-b border-zinc-800 px-4 h-16 fixed top-0 left-0 right-0 z-40 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="sidebarOpen = !sidebarOpen"
          class="p-2 text-zinc-400 rounded-lg md:hidden hover:text-zinc-100 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-700"
          aria-label="Buka menu navigasi"
        >
          <Icon name="lucide:menu" class="w-5 h-5" />
        </button>

        <NuxtLink to="/admin" class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-amber-500 text-zinc-950 flex items-center justify-center font-black text-sm shadow-sm">
            RD
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-bold tracking-tight text-zinc-100 leading-none">RD Photobooth</span>
            <span class="text-[10px] text-zinc-500 font-mono">Control Center</span>
          </div>
        </NuxtLink>
      </div>

      <!-- Active Event & Role / Logout -->
      <div class="flex items-center gap-3">
        <!-- Active Event pill -->
        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-xs">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span class="text-zinc-400">Acara:</span>
          <span class="font-semibold text-zinc-200 truncate max-w-[160px]">{{ activeEventName || 'RD Photobooth' }}</span>
        </div>

        <!-- Role Badge -->
        <span
          class="text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider border"
          :class="auth.isAdmin.value
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'"
        >
          {{ auth.isAdmin.value ? 'Admin' : 'Operator' }}
        </span>

        <!-- Lock button -->
        <button
          type="button"
          @click="lockAdmin"
          class="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors focus:outline-none"
          title="Kunci Panel Admin"
        >
          <Icon name="lucide:lock" class="w-4 h-4" />
        </button>
      </div>
    </header>

    <!-- ── Body Wrapper (Below Header) ───────────────────────── -->
    <div class="flex-1 flex pt-16 h-screen overflow-hidden">
      
      <!-- ── Sidebar Navigation ──────────────────────────────── -->
      <aside
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
        class="fixed md:static top-16 bottom-0 left-0 z-30 w-64 h-[calc(100vh-4rem)] transition-transform duration-200 bg-zinc-900 border-r border-zinc-800 md:translate-x-0 shrink-0 flex flex-col justify-between"
        aria-label="Sidebar"
      >
        <div class="overflow-y-auto py-5 px-3 flex-1 flex flex-col justify-between">
          <ul class="space-y-1.5 font-medium text-sm">
            <!-- Dashboard (All) -->
            <li>
              <NuxtLink
                to="/admin"
                @click="sidebarOpen = false"
                class="flex items-center p-2.5 rounded-xl text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors group"
                active-class="bg-zinc-800 text-amber-400 font-bold"
                exact
              >
                <Icon name="lucide:layout-dashboard" class="w-5 h-5 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
                <span class="ml-3">Dashboard</span>
              </NuxtLink>
            </li>

            <!-- Acara (All) -->
            <li>
              <NuxtLink
                to="/admin/event"
                @click="sidebarOpen = false"
                class="flex items-center p-2.5 rounded-xl text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors group"
                active-class="bg-zinc-800 text-amber-400 font-bold"
              >
                <Icon name="lucide:party-popper" class="w-5 h-5 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
                <span class="ml-3">Acara</span>
              </NuxtLink>
            </li>

            <!-- Sesi Foto (All) -->
            <li>
              <NuxtLink
                to="/admin/sessions"
                @click="sidebarOpen = false"
                class="flex items-center p-2.5 rounded-xl text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors group"
                active-class="bg-zinc-800 text-amber-400 font-bold"
              >
                <Icon name="lucide:images" class="w-5 h-5 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
                <span class="ml-3">Sesi Foto</span>
              </NuxtLink>
            </li>

            <!-- Perangkat (All) -->
            <li>
              <NuxtLink
                to="/admin/devices"
                @click="sidebarOpen = false"
                class="flex items-center p-2.5 rounded-xl text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors group"
                active-class="bg-zinc-800 text-amber-400 font-bold"
              >
                <Icon name="lucide:cpu" class="w-5 h-5 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
                <span class="ml-3">Perangkat</span>
              </NuxtLink>
            </li>

            <!-- Admin Only Section -->
            <template v-if="auth.isAdmin.value">
              <li class="pt-3 pb-1 px-3">
                <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Pengelolaan Lanjutan</span>
              </li>

              <!-- Template -->
              <li>
                <NuxtLink
                  to="/admin/templates"
                  @click="sidebarOpen = false"
                  class="flex items-center p-2.5 rounded-xl text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors group"
                  active-class="bg-zinc-800 text-amber-400 font-bold"
                >
                  <Icon name="lucide:layout" class="w-5 h-5 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
                  <span class="ml-3">Template</span>
                </NuxtLink>
              </li>

              <!-- Pengaturan -->
              <li>
                <NuxtLink
                  to="/admin/settings"
                  @click="sidebarOpen = false"
                  class="flex items-center p-2.5 rounded-xl text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors group"
                  active-class="bg-zinc-800 text-amber-400 font-bold"
                >
                  <Icon name="lucide:settings" class="w-5 h-5 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
                  <span class="ml-3">Pengaturan</span>
                </NuxtLink>
              </li>

              <!-- Log -->
              <li>
                <NuxtLink
                  to="/admin/logs"
                  @click="sidebarOpen = false"
                  class="flex items-center p-2.5 rounded-xl text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors group"
                  active-class="bg-zinc-800 text-amber-400 font-bold"
                >
                  <Icon name="lucide:file-text" class="w-5 h-5 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
                  <span class="ml-3">Log</span>
                </NuxtLink>
              </li>
            </template>
          </ul>

          <!-- Bottom Link to Kiosk -->
          <div class="pt-4 border-t border-zinc-800/80">
            <NuxtLink
              to="/"
              @click="sidebarOpen = false"
              class="flex items-center p-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
            >
              <Icon name="lucide:external-link" class="w-4 h-4 text-zinc-500" />
              <span class="ml-3">Buka Layar Booth</span>
            </NuxtLink>
          </div>
        </div>
      </aside>

      <!-- Mobile Backdrop Overlay -->
      <div
        v-if="sidebarOpen"
        @click="sidebarOpen = false"
        class="bg-zinc-950/80 fixed inset-0 z-20 md:hidden backdrop-blur-sm"
      />

      <!-- ── Main Content Area (Independent Scroll) ───────────── -->
      <main class="flex-1 h-[calc(100vh-4rem)] overflow-y-auto p-4 sm:p-6 lg:p-8">
        <slot />
      </main>

    </div>

    <!-- ── PIN Login / Lock Overlay ──────────────────────────── -->
    <div
      v-if="!auth.isAuthenticated.value"
      class="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center p-4 select-none backdrop-blur-md"
    >
      <div
        class="w-full max-w-sm p-6 sm:p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col items-center gap-6"
        @click="pinInputRef?.focus()"
      >
        <div class="flex flex-col items-center gap-2 text-center">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Icon name="lucide:lock" class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-zinc-100">Autentikasi Akses</h2>
            <p class="text-xs text-zinc-400 mt-0.5">Masukkan PIN 6 digit (Admin / Operator)</p>
          </div>
        </div>

        <!-- PIN Dots Indicator -->
        <div class="flex justify-center gap-3 my-1">
          <span
            v-for="i in 6"
            :key="i"
            class="w-3.5 h-3.5 rounded-full border-2 transition-all duration-150"
            :class="pinInput.length >= i ? 'bg-amber-500 border-amber-500 scale-110' : 'bg-zinc-800 border-zinc-700'"
          />
        </div>

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

        <!-- Keypad -->
        <div class="grid grid-cols-3 gap-2.5 w-full">
          <button
            v-for="n in ['1','2','3','4','5','6','7','8','9','','0','⌫']"
            :key="n"
            type="button"
            class="h-13 py-3 flex items-center justify-center text-lg font-bold text-zinc-100 bg-zinc-800/80 border border-zinc-700/80 rounded-2xl hover:bg-zinc-700 hover:text-amber-400 active:scale-95 transition-all focus:outline-none"
            :class="n === '' ? 'invisible pointer-events-none' : ''"
            :disabled="n === ''"
            @click="onNumpad(n)"
          >
            <Icon v-if="n === '⌫'" name="lucide:delete" class="w-5 h-5" />
            <span v-else>{{ n }}</span>
          </button>
        </div>

        <p v-if="pinError" class="text-xs text-rose-400 font-semibold animate-shake">
          PIN tidak cocok. Silakan coba lagi.
        </p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useAuth }    from '~/composables/useAuth'
import { settingsDB } from '~/services/db'

const auth            = useAuth()
const pinInput        = ref('')
const pinError        = ref(false)
const pinInputRef     = ref<HTMLInputElement | null>(null)
const sidebarOpen     = ref(false)
const activeEventName = ref('')

onMounted(async () => {
  await auth.loadPins()
  activeEventName.value = (await settingsDB.get<string>('activeEventName'))
    || (typeof localStorage !== 'undefined' ? localStorage.getItem('photobooth_event_name') : '')
    || 'RD Photobooth'

  if (!auth.isAuthenticated.value) {
    nextTick(() => pinInputRef.value?.focus())
  }
})

function onNumpad(key: string) {
  if (key === '⌫') {
    pinInput.value = pinInput.value.slice(0, -1)
    pinError.value = false
    return
  }
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
</script>
