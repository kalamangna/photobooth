import { ref, computed } from 'vue'
import { settingsDB } from '~/services/db'
import { hashPin, verifyPinHash, isHashedPin } from '~/utils/crypto'

export type UserRole = 'admin' | 'operator'

export const DEFAULT_ADMIN_PIN    = '888888'
export const DEFAULT_OPERATOR_PIN = '123456'

export const useAuth = () => {
  const currentRole = useState<UserRole | null>('auth_role', () => null)
  const isLoaded    = useState<boolean>('auth_loaded', () => false)

  // In-memory: simpan hash (bukan PIN mentah) agar tidak ada PIN plaintext di runtime
  const adminPinHash    = ref<string>('')
  const operatorPinHash = ref<string>('')

  // ─── Load PINs (sebagai hash) dari DB ────────────────────────
  async function loadPins() {
    try {
      // Ambil nilai yang tersimpan (bisa hash baru, bisa plaintext lama)
      const savedAdmin    = await settingsDB.get<string>('adminPin')
      const savedOperator = await settingsDB.get<string>('operatorPin')

      // Migrasi otomatis: jika tersimpan plaintext → hash dan simpan ulang
      if (savedAdmin) {
        if (isHashedPin(savedAdmin)) {
          adminPinHash.value = savedAdmin
        } else {
          // PIN lama belum di-hash — hash sekarang dan persist
          const hashed = await hashPin(savedAdmin)
          adminPinHash.value = hashed
          await settingsDB.set('adminPin', hashed)
        }
      } else {
        adminPinHash.value = await hashPin(DEFAULT_ADMIN_PIN)
      }

      if (savedOperator) {
        if (isHashedPin(savedOperator)) {
          operatorPinHash.value = savedOperator
        } else {
          const hashed = await hashPin(savedOperator)
          operatorPinHash.value = hashed
          await settingsDB.set('operatorPin', hashed)
        }
      } else {
        operatorPinHash.value = await hashPin(DEFAULT_OPERATOR_PIN)
      }

      if (typeof sessionStorage !== 'undefined') {
        const savedRole = sessionStorage.getItem('photobooth_auth_role') as UserRole | null
        if (savedRole === 'admin' || savedRole === 'operator') {
          currentRole.value = savedRole
        }
      }
    } catch {
      // Fallback ke default hash
      adminPinHash.value    = await hashPin(DEFAULT_ADMIN_PIN)
      operatorPinHash.value = await hashPin(DEFAULT_OPERATOR_PIN)
    } finally {
      isLoaded.value = true
    }
  }

  // ─── Verifikasi PIN mentah terhadap hash tersimpan ────────────
  async function verifyPin(pin: string): Promise<UserRole | null> {
    await loadPins()

    const trimmed = pin.trim()

    // Verifikasi terhadap hash tersimpan (atau plaintext lama via backward-compat)
    const isAdmin    = await verifyPinHash(trimmed, adminPinHash.value)
    const isOperator = !isAdmin && await verifyPinHash(trimmed, operatorPinHash.value)

    if (isAdmin) {
      currentRole.value = 'admin'
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('photobooth_auth_role', 'admin')
      }
      return 'admin'
    }

    if (isOperator) {
      currentRole.value = 'operator'
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('photobooth_auth_role', 'operator')
      }
      return 'operator'
    }

    return null
  }

  // ─── Update PIN — simpan sebagai hash ────────────────────────
  async function updateAdminPin(newPin: string): Promise<boolean> {
    if (newPin.trim().length !== 6) return false
    const hashed = await hashPin(newPin.trim())
    adminPinHash.value = hashed
    await settingsDB.set('adminPin', hashed)
    return true
  }

  async function updateOperatorPin(newPin: string): Promise<boolean> {
    if (newPin.trim().length !== 6) return false
    const hashed = await hashPin(newPin.trim())
    operatorPinHash.value = hashed
    await settingsDB.set('operatorPin', hashed)
    return true
  }

  function logout() {
    currentRole.value = null
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('photobooth_auth_role')
      sessionStorage.removeItem('photobooth_admin_auth')
    }
  }

  return {
    currentRole,
    isAuthenticated: computed(() => currentRole.value !== null),
    isAdmin:         computed(() => currentRole.value === 'admin'),
    isOperator:      computed(() => currentRole.value === 'operator'),
    isLoaded,
    loadPins,
    verifyPin,
    updateAdminPin,
    updateOperatorPin,
    logout,
  }
}
