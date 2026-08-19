<template>
  <div class="flex flex-col items-center gap-3 w-full">
    <div class="flex flex-col items-center gap-0.5 text-center">
      <span v-if="hasCustomEvent" class="text-xs font-bold text-amber-400">
        {{ eventName }}
      </span>
      <p class="text-xs font-semibold text-zinc-200">Scan QR untuk download foto</p>
    </div>

    <!-- QR Code -->
    <div
      class="w-[clamp(200px,70%,280px)] aspect-square bg-white rounded-2xl p-3 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/20 my-1"
    >
      <img
        v-if="qrDataUrl"
        :src="qrDataUrl"
        class="w-full h-full object-contain"
        alt="QR Foto"
      />
      <Icon v-else name="lucide:loader-2" class="w-8 h-8 text-amber-400 animate-spin" />
    </div>

    <!-- Email Backup Form -->
    <div class="w-full mt-1 flex flex-col gap-2">
      <p class="text-[11px] text-zinc-400 text-center">── atau masukkan email ──</p>
      <div
        v-if="emailSent"
        class="w-full py-3 px-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2 text-emerald-400 text-xs font-semibold"
      >
        <Icon name="lucide:check-circle-2" class="w-4 h-4 shrink-0" />
        <span>Email berhasil disimpan ✓</span>
      </div>
      <div v-else class="flex items-center gap-2">
        <input
          v-model="custEmail"
          type="email"
          placeholder="nama@gmail.com"
          class="flex-1 px-3.5 py-3 rounded-2xl bg-zinc-950 border text-zinc-100 text-xs font-sans placeholder-zinc-500 outline-none transition-colors"
          :class="
            emailError
              ? 'border-rose-500/60 focus:border-rose-500'
              : 'border-zinc-800 focus:border-amber-500'
          "
          @input="emailError = false"
          @keyup.enter="handleSendEmail"
        />
        <button
          class="py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center min-w-[70px]"
          :disabled="isSendingEmail || !custEmail"
          @click="handleSendEmail"
        >
          <Icon v-if="isSendingEmail" name="lucide:loader-2" class="w-3.5 h-3.5 animate-spin" />
          <span v-else>Simpan</span>
        </button>
      </div>
      <span v-if="emailError" class="text-[10px] text-rose-400 text-center">
        {{ emailErrorMsg }}
      </span>
    </div>

    <div class="flex flex-col items-center gap-0.5 text-center mt-1">
      <p class="text-[11px] text-zinc-300 font-semibold">Foto akan dicetak oleh operator</p>
      <p class="text-[10px] text-zinc-500">Silakan ambil hasil cetak di meja operator</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'
import { useSessionStore } from '~/stores/session'

const props = defineProps<{
  eventName: string
  hasCustomEvent: boolean
  sessionId: string | null
}>()

const emit = defineEmits<{
  emailSaved: [email: string]
}>()

const sessionStore = useSessionStore()

const qrDataUrl      = ref('')
const custEmail      = ref('')
const emailSent      = ref(false)
const emailError     = ref(false)
const emailErrorMsg  = ref('Email wajib diisi.')
const isSendingEmail = ref(false)

async function generateQRCode(url: string) {
  try {
    qrDataUrl.value = await QRCode.toDataURL(url, {
      width: 360,
      margin: 1.5,
      color: { dark: '#09090b', light: '#ffffff' },
    })
  } catch (err) {
    console.error('QR generation failed:', err)
  }
}

function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

async function handleSendEmail() {
  const email = custEmail.value.trim()
  emailError.value = false

  if (!email) {
    emailErrorMsg.value = 'Email wajib diisi'
    emailError.value = true
    return
  }
  if (!isEmailValid(email)) {
    emailErrorMsg.value = 'Format email tidak valid'
    emailError.value = true
    return
  }

  isSendingEmail.value = true
  try {
    // 1. Simpan email pelanggan ke state sesi dan IndexedDB lokal
    await sessionStore.setCustomerEmail(email, props.sessionId || undefined)

    // 2. Kirim update email langsung ke server agar dashboard admin seketika menerima update
    if (props.sessionId) {
      await $fetch('/api/sessions', {
        method: 'POST',
        body: {
          id: props.sessionId,
          customerEmail: email,
        },
      }).catch(() => {})
    }

    emailSent.value = true
    emit('emailSaved', email)
  } catch (err: any) {
    emailError.value = true
    emailErrorMsg.value = err?.message || 'Gagal menyimpan email.'
  } finally {
    isSendingEmail.value = false
  }
}

const targetDownloadUrl = computed(() => {
  // 1. Cek dari sesi aktif
  if (sessionStore.current?.cloudUrl) {
    return sessionStore.current.cloudUrl
  }
  // 2. Cek dari riwayat sesi jika sudah selesai
  if (props.sessionId) {
    const hist = sessionStore.history.find(s => s.id === props.sessionId)
    if (hist?.cloudUrl) {
      return hist.cloudUrl
    }
  }
  // 3. Fallback lokal
  if (props.sessionId && typeof window !== 'undefined') {
    return `${window.location.origin}/download/${props.sessionId}`
  }
  return ''
})

watch(
  targetDownloadUrl,
  async (newUrl) => {
    if (newUrl) {
      await generateQRCode(newUrl)
    }
  },
  { immediate: true },
)
</script>
