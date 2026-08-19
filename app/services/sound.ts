/**
 * Sound Service — Pure Web Audio API Sound Synthesizer
 * Menghasilkan suara countdown beep, shutter kamera, dan success chime secara sintetis
 * tanpa ketergantungan file eksternal (zero latency & no network delay).
 */
import { settingsDB } from '~/services/db'

let audioCtx: AudioContext | null = null
let isAudioEnabled = true

/**
 * Inisialisasi dan unlock AudioContext pada interaksi pertama pengguna (iOS/Safari compatible)
 */
export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass()
    }
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }

  return audioCtx
}

/**
 * Memperbarui status izin audio dari pengaturan
 */
export async function syncAudioSetting(): Promise<boolean> {
  try {
    const saved = await settingsDB.get<boolean>('audioFeedbackEnabled')
    if (typeof saved === 'boolean') {
      isAudioEnabled = saved
    } else {
      isAudioEnabled = true
    }
  } catch {
    isAudioEnabled = true
  }
  return isAudioEnabled
}

export function setAudioEnabled(enabled: boolean) {
  isAudioEnabled = enabled
}

/**
 * 1. Suara Countdown Beep (Detik 3, 2, 1)
 */
export function playCountdownBeep(isFinal = false) {
  if (!isAudioEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    // Nada lebih tinggi untuk detik terakhir (1)
    const freq = isFinal ? 1318.51 : 880 // E6 vs A5
    osc.type = isFinal ? 'triangle' : 'sine'
    osc.frequency.setValueAtTime(freq, now)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.exponentialRampToValueAtTime(0.35, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.28 : 0.16))

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + (isFinal ? 0.3 : 0.18))
  } catch (err) {
    console.warn('[Sound] Beep error:', err)
  }
}

/**
 * 2. Suara Jepretan Shutter Kamera Mekanikal (Flash & Click)
 */
export function playShutterSound() {
  if (!isAudioEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime

    // ── Phase 1: Mechanical Snap (Noise Burst) ─────────────────
    const bufferSize = Math.floor(ctx.sampleRate * 0.08)
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2))
    }

    const whiteNoise = ctx.createBufferSource()
    whiteNoise.buffer = noiseBuffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(1200, now)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.4, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

    whiteNoise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    whiteNoise.start(now)

    // ── Phase 2: Dual Click Tone (Mechanical Curtain) ──────────
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(320, now + 0.02)
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.12)

    gain.gain.setValueAtTime(0.001, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + 0.02)
    osc.stop(now + 0.14)
  } catch (err) {
    console.warn('[Sound] Shutter error:', err)
  }
}

/**
 * 3. Suara Success Chime (Selesai Pemotretan & Render)
 */
export function playSuccessChime() {
  if (!isAudioEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.09
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.45)
    })
  } catch (err) {
    console.warn('[Sound] Success chime error:', err)
  }
}
