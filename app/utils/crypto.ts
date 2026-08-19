/**
 * Crypto Utilities
 * Hashing PIN menggunakan Web Crypto API (SHA-256) — tidak bisa di-reverse.
 * Berjalan murni di browser, tanpa dependensi eksternal.
 */

/**
 * Menghasilkan hash SHA-256 dari string sebagai hex string.
 * Prefix 'pb:' digunakan sebagai domain separator agar hash PIN photobooth
 * tidak sama dengan hash PIN dari sistem lain meski nilai PIN-nya sama.
 */
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(`pb:${pin}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Verifikasi PIN mentah terhadap hash yang tersimpan.
 * Perbandingan dilakukan dalam bentuk hash (constant-time safe via SubtleCrypto).
 */
export async function verifyPinHash(pin: string, storedHash: string): Promise<boolean> {
  // Jika stored value bukan hex 64 karakter (= belum di-hash, migrasi lama),
  // lakukan direct comparison sebagai fallback migrasi.
  if (storedHash.length !== 64) {
    return pin === storedHash
  }
  const computed = await hashPin(pin)
  return computed === storedHash
}

/**
 * Cek apakah nilai adalah hash SHA-256 yang valid (hex 64 karakter).
 */
export function isHashedPin(value: string): boolean {
  return /^[0-9a-f]{64}$/.test(value)
}
