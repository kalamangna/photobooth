<template>
  <div class="w-full h-full flex items-center justify-center relative overflow-hidden bg-zinc-950 select-none p-6 sm:p-10 touch-manipulation">

    <Transition
      appear
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-6"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-3"
    >
      <div class="relative z-10 w-full max-w-md flex flex-col gap-8">

        <!-- Back -->
        <NuxtLink
          replace
          to="/"
          class="self-start text-sm text-zinc-500 hover:text-zinc-200 transition-colors font-medium flex items-center gap-1.5 -ml-1"
        >
          <Icon name="lucide:arrow-left" class="w-4 h-4" />
          <span>Kembali</span>
        </NuxtLink>

        <!-- Header -->
        <div class="flex flex-col gap-1">
          <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
            Atur Sesi Foto
          </h1>
          <p class="text-sm text-zinc-500">Pilih jumlah foto dan waktu hitung mundur.</p>
        </div>

        <!-- Shot Count Selection -->
        <section class="flex flex-col gap-3">
          <label class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Jumlah Foto</label>
          <div class="grid grid-cols-4 gap-2.5">
            <button
              v-for="n in [1, 2, 3, 4]"
              :key="n"
              :id="`shot-count-${n}`"
              class="flex flex-col items-center justify-center gap-1 py-5 rounded-2xl border transition-all duration-150 active:scale-95 select-none"
              :class="totalShots === n
                ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'"
              @click="totalShots = n"
            >
              <span class="text-3xl font-black font-mono leading-none">{{ n }}</span>
              <span class="text-[10px] font-semibold uppercase tracking-wider">
                {{ n === 1 ? 'foto' : 'foto' }}
              </span>
            </button>
          </div>
        </section>

        <!-- Countdown Selection -->
        <section class="flex flex-col gap-3">
          <label class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Hitung Mundur</label>
          <div class="grid grid-cols-2 gap-2.5">
            <button
              v-for="sec in [3, 5]"
              :key="sec"
              :id="`countdown-${sec}`"
              class="flex items-center justify-center gap-2 py-3.5 rounded-2xl border transition-all duration-150 active:scale-95 select-none font-mono font-bold text-sm"
              :class="countdownSec === sec
                ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'"
              @click="countdownSec = sec"
            >
              <Icon name="lucide:timer" class="w-4 h-4" />
              {{ sec }} detik
            </button>
          </div>
        </section>

        <!-- CTA -->
        <button
          id="btn-continue-setup"
          class="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-bold text-base transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2.5 mt-1"
          @click="proceed"
        >
          <span>Lanjut</span>
          <Icon name="lucide:arrow-right" class="w-5 h-5" />
        </button>

      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import { settingsDB }      from '~/services/db'

definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Photobooth — Atur Sesi' })

const router       = useRouter()
const sessionStore = useSessionStore()

const totalShots = computed({
  get: () => sessionStore.configuredShots || 3,
  set: (val: number) => {
    sessionStore.configuredShots = val
    settingsDB.set('lastTotalShots', val).catch(() => {})
  },
})

const countdownSec = computed({
  get: () => sessionStore.configuredCountdown || 5,
  set: (val: number) => {
    sessionStore.configuredCountdown = val
    settingsDB.set('activeCountdown', val).catch(() => {})
  },
})

onMounted(async () => {
  // If not customized yet, load operator default from database once
  if (!sessionStore.configuredShots) {
    const savedShots = await settingsDB.get<number>('lastTotalShots')
    if (savedShots) sessionStore.configuredShots = savedShots
  }

  if (!sessionStore.configuredCountdown) {
    const savedCountdown = await settingsDB.get<number>('activeCountdown')
    if (savedCountdown && (savedCountdown === 3 || savedCountdown === 5)) {
      sessionStore.configuredCountdown = savedCountdown
    }
  }
})

async function proceed() {
  await sessionStore.startSession({
    totalShots: totalShots.value,
  })

  await router.push('/session')
}
</script>
