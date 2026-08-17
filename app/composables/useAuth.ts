import { ref, computed } from 'vue'
import { settingsDB } from '~/services/db'

export type UserRole = 'admin' | 'operator'

export const DEFAULT_ADMIN_PIN = '888888'
export const DEFAULT_OPERATOR_PIN = '123456'

export const useAuth = () => {
  const currentRole = useState<UserRole | null>('auth_role', () => null)
  const isLoaded = useState<boolean>('auth_loaded', () => false)

  const adminPin = ref(DEFAULT_ADMIN_PIN)
  const operatorPin = ref(DEFAULT_OPERATOR_PIN)

  // Load saved PINs from DB
  async function loadPins() {
    try {
      const savedAdminPin = await settingsDB.get<string>('adminPin')
      if (savedAdminPin) adminPin.value = savedAdminPin

      const savedOperatorPin = await settingsDB.get<string>('operatorPin')
      if (savedOperatorPin) operatorPin.value = savedOperatorPin

      if (typeof sessionStorage !== 'undefined') {
        const savedRole = sessionStorage.getItem('photobooth_auth_role') as UserRole | null
        if (savedRole === 'admin' || savedRole === 'operator') {
          currentRole.value = savedRole
        }
      }
    } catch {
      // fallback to defaults
    } finally {
      isLoaded.value = true
    }
  }

  // Verify entered PIN and authenticate with appropriate role
  async function verifyPin(pin: string): Promise<UserRole | null> {
    await loadPins()

    const trimmed = pin.trim()
    if (trimmed === adminPin.value) {
      currentRole.value = 'admin'
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('photobooth_auth_role', 'admin')
      }
      return 'admin'
    } else if (trimmed === operatorPin.value) {
      currentRole.value = 'operator'
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('photobooth_auth_role', 'operator')
      }
      return 'operator'
    }

    return null
  }

  // Update PINs (Admin only)
  async function updateAdminPin(newPin: string): Promise<boolean> {
    if (newPin.trim().length !== 6) return false
    adminPin.value = newPin.trim()
    await settingsDB.set('adminPin', adminPin.value)
    return true
  }

  async function updateOperatorPin(newPin: string): Promise<boolean> {
    if (newPin.trim().length !== 6) return false
    operatorPin.value = newPin.trim()
    await settingsDB.set('operatorPin', operatorPin.value)
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
    isAdmin: computed(() => currentRole.value === 'admin'),
    isOperator: computed(() => currentRole.value === 'operator'),
    isLoaded,
    adminPin,
    operatorPin,
    loadPins,
    verifyPin,
    updateAdminPin,
    updateOperatorPin,
    logout,
  }
}
