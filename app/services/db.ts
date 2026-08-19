/**
 * IndexedDB Service
 * Local-first persistence untuk sessions, templates, settings, print jobs, dan logs.
 * Dilengkapi in-memory fallback otomatis dengan zero-latency jika IndexedDB diblokir atau lambat.
 *
 * v2: Foto raw dan output composite disimpan sebagai Blob terpisah di
 *     `session_photos` store, bukan inline base64 di session document.
 *     Server hanya menerima metadata (tanpa binary) → hemat bandwidth & storage.
 */

const DB_NAME    = 'photobooth-db'
const DB_VERSION = 2  // bumped: photo blobs separated from session document

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export interface SystemLog {
  id?: number
  timestamp: string
  level: LogLevel
  module: string
  event: string
  message: string
  metadata?: Record<string, unknown>
}

export interface BoothSettings {
  id?: number
  key: string
  value: unknown
  updatedAt: string
}

/** Record untuk foto raw per slot yang disimpan sebagai Blob */
export interface StoredPhotoBlob {
  id?: number          // autoIncrement key
  sessionId: string
  slotIndex: number    // 0-based index slot foto
  blob: Blob
  capturedAt: string | null
}

/** Record untuk output composite (foto hasil render) per sesi */
export interface StoredOutputBlob {
  id?: number
  sessionId: string
  slotIndex: -1        // sentinel: -1 = output composite
  blob: Blob
  capturedAt: string | null
}

// ─── Store names ──────────────────────────────────────────────
const STORES = {
  SETTINGS:      'settings',
  SESSIONS:      'sessions',
  SESSION_PHOTOS:'session_photos',
  PRINT_JOBS:    'print_jobs',
  TEMPLATES:     'templates',
  SYSTEM_LOGS:   'system_logs',
} as const

// ─── In-Memory Storage Fallback ───────────────────────────────
// Menjamin seluruh fitur aplikasi tetap berjalan lancar 100% tanpa blocking
// jika IndexedDB diblokir tab lain, korup, atau mode private browsing.
const _memStores = {
  settings:       new Map<string, unknown>(),
  sessions:       new Map<string, unknown>(),
  session_photos: new Map<string, StoredPhotoBlob>(),
  print_jobs:     new Map<string, unknown>(),
  templates:      new Map<string, unknown>(),
  system_logs:    [] as SystemLog[],
}

let _db: IDBDatabase | null = null
let _dbPromise: Promise<IDBDatabase> | null = null
let _isMemoryMode = false

// ─── Open DB ──────────────────────────────────────────────────
export function openDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available in this environment'))
  }
  if (_db) return Promise.resolve(_db)
  if (_isMemoryMode) {
    return Promise.reject(new Error('IndexedDB operating in memory fallback mode'))
  }
  if (_dbPromise) return _dbPromise

  _dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    let resolved = false
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        _isMemoryMode = true
        _dbPromise = null
        console.warn('[DB] IndexedDB opening timed out (3000ms), switched to instantaneous memory fallback mode.')
        reject(new Error('IndexedDB connection timed out'))
      }
    }, 3000)

    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION)

      req.onblocked = () => {
        console.warn('[DB] IndexedDB upgrade blocked by another connection. Please close other open photobooth tabs.')
      }

      req.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // settings
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          const s = db.createObjectStore(STORES.SETTINGS, { keyPath: 'id', autoIncrement: true })
          s.createIndex('key', 'key', { unique: true })
        }

        // sessions
        if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
          const s = db.createObjectStore(STORES.SESSIONS, { keyPath: 'id' })
          s.createIndex('state',     'state',     { unique: false })
          s.createIndex('startedAt', 'startedAt', { unique: false })
        }

        // session_photos — v2: tambah index slotIndex, simpan Blob bukan base64
        if (!db.objectStoreNames.contains(STORES.SESSION_PHOTOS)) {
          const s = db.createObjectStore(STORES.SESSION_PHOTOS, { keyPath: 'id', autoIncrement: true })
          s.createIndex('sessionId',  'sessionId',  { unique: false })
          s.createIndex('slotIndex',  'slotIndex',  { unique: false })
          s.createIndex('sessionSlot', ['sessionId', 'slotIndex'], { unique: false })
        } else {
          // Upgrade v1→v2: tambah index yang belum ada
          const tx = (event.target as IDBOpenDBRequest).transaction!
          const s  = tx.objectStore(STORES.SESSION_PHOTOS)
          if (!s.indexNames.contains('slotIndex')) {
            s.createIndex('slotIndex', 'slotIndex', { unique: false })
          }
          if (!s.indexNames.contains('sessionSlot')) {
            s.createIndex('sessionSlot', ['sessionId', 'slotIndex'], { unique: false })
          }
        }

        // print_jobs
        if (!db.objectStoreNames.contains(STORES.PRINT_JOBS)) {
          const s = db.createObjectStore(STORES.PRINT_JOBS, { keyPath: 'id' })
          s.createIndex('sessionId', 'sessionId', { unique: false })
          s.createIndex('status',    'status',    { unique: false })
        }

        // templates
        if (!db.objectStoreNames.contains(STORES.TEMPLATES)) {
          db.createObjectStore(STORES.TEMPLATES, { keyPath: 'id' })
        }

        // system_logs
        if (!db.objectStoreNames.contains(STORES.SYSTEM_LOGS)) {
          const s = db.createObjectStore(STORES.SYSTEM_LOGS, { keyPath: 'id', autoIncrement: true })
          s.createIndex('level',     'level',     { unique: false })
          s.createIndex('module',    'module',    { unique: false })
          s.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }

      req.onsuccess = () => {
        clearTimeout(timeout)
        const db = req.result
        if (resolved) {
          db.close()
          return
        }
        resolved = true
        _db = db
        _isMemoryMode = false
        _db.onversionchange = () => {
          _db?.close()
          _db = null
          _dbPromise = null
        }
        _db.onclose = () => {
          _db = null
          _dbPromise = null
        }
        resolve(_db)
      }

      req.onerror = () => {
        clearTimeout(timeout)
        if (resolved) return
        resolved = true
        _isMemoryMode = true
        _dbPromise = null
        reject(req.error)
      }
    } catch (err) {
      clearTimeout(timeout)
      _isMemoryMode = true
      _dbPromise = null
      reject(err)
    }
  }).finally(() => {
    _dbPromise = null
  })

  return _dbPromise
}

// ─── Generic CRUD helpers ─────────────────────────────────────

/** Strip Vue reactive Proxy and produce a plain, IDB-serializable object */
function toPlain<T>(record: T): T {
  return JSON.parse(JSON.stringify(record)) as T
}

async function put<T>(storeName: string, record: T): Promise<T> {
  const plain = toPlain(record)
  const map   = _memStores[storeName as keyof typeof _memStores]
  if (map instanceof Map) {
    const key = (plain as Record<string, unknown>).id ?? (plain as Record<string, unknown>).key ?? String(Date.now())
    map.set(key as string, plain)
  }

  try {
    const db = await openDB()
    return await new Promise<T>((resolve, reject) => {
      const tx  = db.transaction(storeName, 'readwrite')
      const req = tx.objectStore(storeName).put(plain)
      req.onsuccess = () => resolve(plain)
      req.onerror   = () => reject(req.error)
    })
  } catch {
    return plain
  }
}

async function getByKey<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
  try {
    const db = await openDB()
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx  = db.transaction(storeName, 'readonly')
      const req = tx.objectStore(storeName).get(key)
      req.onsuccess = () => resolve(req.result as T | undefined)
      req.onerror   = () => reject(req.error)
    })
  } catch {
    const map = _memStores[storeName as keyof typeof _memStores]
    if (map instanceof Map) return map.get(key as string) as T | undefined
    return undefined
  }
}

async function getAll<T>(storeName: string): Promise<T[]> {
  try {
    const db = await openDB()
    return await new Promise<T[]>((resolve, reject) => {
      const tx  = db.transaction(storeName, 'readonly')
      const req = tx.objectStore(storeName).getAll()
      req.onsuccess = () => resolve(req.result as T[])
      req.onerror   = () => reject(req.error)
    })
  } catch {
    const store = _memStores[storeName as keyof typeof _memStores]
    if (Array.isArray(store)) return [...store] as unknown as T[]
    if (store instanceof Map) return Array.from(store.values()) as T[]
    return []
  }
}

async function deleteByKey(storeName: string, key: IDBValidKey): Promise<void> {
  const map = _memStores[storeName as keyof typeof _memStores]
  if (map instanceof Map) map.delete(key as string)

  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx  = db.transaction(storeName, 'readwrite')
      const req = tx.objectStore(storeName).delete(key)
      req.onsuccess = () => resolve()
      req.onerror   = () => reject(req.error)
    })
  } catch {
    // Handled in memory
  }
}

// ─── Blob ↔ DataUrl helpers ───────────────────────────────────

/** Konversi base64 dataUrl → Blob */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',')
  const mimeMatch = header.match(/:(.*?);/)
  const mime      = mimeMatch ? mimeMatch[1] : 'image/jpeg'
  const bytes     = atob(data)
  const arr       = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

/** Konversi Blob → base64 dataUrl */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

/**
 * Strip semua field binary (base64 dataUrl) dari session object.
 * Digunakan sebelum sinkronisasi ke server atau simpan ke IDB sessions store.
 * Photos hanya menyimpan metadata (index + capturedAt), bukan dataUrl.
 */
export function stripSessionBinary<T extends { photos?: unknown[]; outputUrl?: unknown }>(session: T): T {
  return {
    ...session,
    outputUrl: null,
    photos: Array.isArray(session.photos)
      ? session.photos.map((p: unknown) => {
          if (p && typeof p === 'object') {
            const slot = p as Record<string, unknown>
            return { index: slot.index, capturedAt: slot.capturedAt, dataUrl: null }
          }
          return p
        })
      : session.photos,
  }
}

// ─── Settings ────────────────────────────────────────────────
// In-memory cache: menghindari $fetch ke server setiap kali get() dipanggil.
// Cache diinvalidasi saat set() dipanggil agar tetap konsisten.
const _settingsCache = {
  data: null as Record<string, unknown> | null,
  fetchedAt: 0,
  TTL_MS: 30_000, // 30 detik

  isValid(): boolean {
    return this.data !== null && (Date.now() - this.fetchedAt) < this.TTL_MS
  },

  set(data: Record<string, unknown>) {
    this.data      = data
    this.fetchedAt = Date.now()
  },

  invalidate() {
    this.data      = null
    this.fetchedAt = 0
  },
}

export const settingsDB = {
  async get<T = unknown>(key: string): Promise<T | undefined> {
    // 1. Cek cache in-memory dulu
    if (_settingsCache.isValid() && _settingsCache.data && key in _settingsCache.data) {
      return _settingsCache.data[key] as T
    }

    // 2. Fetch ke server (hanya jika cache miss atau expired)
    try {
      const serverSettings = await $fetch<Record<string, unknown>>('/api/settings').catch(() => null)
      if (serverSettings) {
        _settingsCache.set(serverSettings)
        if (key in serverSettings) {
          return serverSettings[key] as T
        }
      }
    } catch {
      // Offline fallback ke IndexedDB / Memory
    }

    // 3. Fallback IndexedDB lokal
    try {
      const db = await openDB()
      return await new Promise<T | undefined>((resolve) => {
        const tx  = db.transaction(STORES.SETTINGS, 'readonly')
        const req = tx.objectStore(STORES.SETTINGS).index('key').get(key)
        req.onsuccess = () => resolve(req.result?.value as T | undefined)
        req.onerror   = () => resolve(undefined)
      })
    } catch {
      return _memStores.settings.get(key) as T | undefined
    }
  },

  async set(key: string, value: unknown): Promise<void> {
    // Invalidasi cache agar get() berikutnya tidak baca data lama
    _settingsCache.invalidate()
    _memStores.settings.set(key, value)

    // Send to central server API
    try {
      await $fetch('/api/settings', {
        method: 'POST',
        body: { [key]: value },
      }).catch(() => {})
    } catch {
      // Ignore if offline
    }

    try {
      const db = await openDB()
      await new Promise<void>((resolve) => {
        const tx    = db.transaction(STORES.SETTINGS, 'readwrite')
        const store = tx.objectStore(STORES.SETTINGS)
        const index = store.index('key')
        const req   = index.get(key)
        req.onsuccess = () => {
          const existing = req.result as BoothSettings | undefined
          const record: BoothSettings = {
            ...(existing ?? {}),
            key,
            value,
            updatedAt: new Date().toISOString(),
          }
          const putReq = store.put(record)
          putReq.onsuccess = () => resolve()
          putReq.onerror   = () => resolve()
        }
        req.onerror = () => resolve()
      })
    } catch {
      // Handled in memory
    }
  },
}

// ─── Session Photos (Blob Store) ─────────────────────────────
/**
 * Penyimpanan foto sesi sebagai Blob native di IndexedDB.
 * Slot -1 = output composite (foto hasil render template).
 * Slot 0..N = foto raw per jepretan.
 */
export const sessionPhotosDB = {
  /** Simpan atau update satu foto/output untuk sesi tertentu */
  async upsert(sessionId: string, slotIndex: number, dataUrl: string, capturedAt: string | null): Promise<void> {
    const blob = dataUrlToBlob(dataUrl)
    const key  = `${sessionId}:${slotIndex}`
    _memStores.session_photos.set(key, { sessionId, slotIndex, blob, capturedAt })

    try {
      const db = await openDB()
      await new Promise<void>((resolve, reject) => {
        const tx    = db.transaction(STORES.SESSION_PHOTOS, 'readwrite')
        const store = tx.objectStore(STORES.SESSION_PHOTOS)

        const indexReq = store.index('sessionSlot').get([sessionId, slotIndex])
        indexReq.onsuccess = () => {
          const existing = indexReq.result as (StoredPhotoBlob & { id?: number }) | undefined
          const record: StoredPhotoBlob = {
            ...(existing ?? {}),
            sessionId,
            slotIndex,
            blob,
            capturedAt,
          }
          const putReq = store.put(record)
          putReq.onsuccess = () => resolve()
          putReq.onerror   = () => reject(putReq.error)
        }
        indexReq.onerror = () => reject(indexReq.error)
      })
    } catch {
      // Saved in memory fallback
    }
  },

  /** Ambil dataUrl untuk satu slot (rekonstruksi dari Blob) */
  async getDataUrl(sessionId: string, slotIndex: number): Promise<string | null> {
    try {
      const db = await openDB()
      const record = await new Promise<StoredPhotoBlob | undefined>((resolve, reject) => {
        const tx  = db.transaction(STORES.SESSION_PHOTOS, 'readonly')
        const req = tx.objectStore(STORES.SESSION_PHOTOS).index('sessionSlot').get([sessionId, slotIndex])
        req.onsuccess = () => resolve(req.result as StoredPhotoBlob | undefined)
        req.onerror   = () => reject(req.error)
      })
      if (record?.blob) {
        return await blobToDataUrl(record.blob)
      }
    } catch {
      // Fallback ke memory
    }

    const mem = _memStores.session_photos.get(`${sessionId}:${slotIndex}`)
    if (mem?.blob) {
      try {
        return await blobToDataUrl(mem.blob)
      } catch {
        return null
      }
    }
    return null
  },

  /**
   * Rekonstruksi semua foto (raw shots + output) untuk satu sesi.
   * Returns: { photos: Map<slotIndex, dataUrl>, outputUrl: string | null }
   */
  async restoreSession(sessionId: string): Promise<{
    photos: Map<number, string>
    outputUrl: string | null
  }> {
    const photos    = new Map<number, string>()
    let outputUrl: string | null = null

    try {
      const db = await openDB()
      const records = await new Promise<StoredPhotoBlob[]>((resolve, reject) => {
        const tx  = db.transaction(STORES.SESSION_PHOTOS, 'readonly')
        const req = tx.objectStore(STORES.SESSION_PHOTOS).index('sessionId').getAll(sessionId)
        req.onsuccess = () => resolve(req.result as StoredPhotoBlob[])
        req.onerror   = () => reject(req.error)
      })

      await Promise.all(records.map(async (r) => {
        try {
          const dataUrl = await blobToDataUrl(r.blob)
          if (r.slotIndex === -1) {
            outputUrl = dataUrl
          } else {
            photos.set(r.slotIndex, dataUrl)
          }
        } catch {
          // Blob corrupt
        }
      }))

      if (photos.size > 0 || outputUrl) {
        return { photos, outputUrl }
      }
    } catch {
      // Fallback ke memory
    }

    for (const record of _memStores.session_photos.values()) {
      if (record.sessionId === sessionId) {
        try {
          const dataUrl = await blobToDataUrl(record.blob)
          if (record.slotIndex === -1) {
            outputUrl = dataUrl
          } else {
            photos.set(record.slotIndex, dataUrl)
          }
        } catch {}
      }
    }

    return { photos, outputUrl }
  },

  /** Hapus semua foto untuk sesi tertentu (saat sesi dihapus) */
  async deleteForSession(sessionId: string): Promise<void> {
    for (const [key, record] of _memStores.session_photos.entries()) {
      if (record.sessionId === sessionId) {
        _memStores.session_photos.delete(key)
      }
    }

    try {
      const db = await openDB()
      await new Promise<void>((resolve, reject) => {
        const tx    = db.transaction(STORES.SESSION_PHOTOS, 'readwrite')
        const store = tx.objectStore(STORES.SESSION_PHOTOS)
        const req   = store.index('sessionId').openCursor(sessionId)
        req.onsuccess = () => {
          const cursor = req.result
          if (cursor) { cursor.delete(); cursor.continue() }
          else resolve()
        }
        req.onerror = () => reject(req.error)
      })
    } catch {}
  },

  /** Hapus semua foto hari ini (untuk clearToday) */
  async deleteForSessionIds(ids: string[]): Promise<void> {
    const set = new Set(ids)
    for (const [key, record] of _memStores.session_photos.entries()) {
      if (set.has(record.sessionId)) {
        _memStores.session_photos.delete(key)
      }
    }

    try {
      const db = await openDB()
      await new Promise<void>((resolve, reject) => {
        const tx    = db.transaction(STORES.SESSION_PHOTOS, 'readwrite')
        const store = tx.objectStore(STORES.SESSION_PHOTOS)
        const req   = store.index('sessionId').openCursor()
        req.onsuccess = () => {
          const cursor = req.result
          if (cursor) {
            const record = cursor.value as StoredPhotoBlob
            if (set.has(record.sessionId)) cursor.delete()
            cursor.continue()
          } else {
            resolve()
          }
        }
        req.onerror = () => reject(req.error)
      })
    } catch {}
  },

  /** Hapus semua foto dari semua sesi (untuk clearAll) */
  async clearAll(): Promise<void> {
    _memStores.session_photos.clear()
    try {
      const db = await openDB()
      await new Promise<void>((resolve, reject) => {
        const tx  = db.transaction(STORES.SESSION_PHOTOS, 'readwrite')
        const req = tx.objectStore(STORES.SESSION_PHOTOS).clear()
        req.onsuccess = () => resolve()
        req.onerror   = () => reject(req.error)
      })
    } catch {}
  },
}

// ─── Sessions ─────────────────────────────────────────────────
export const sessionsDB = {
  /**
   * Simpan session ke IDB dan sync ke server dengan mempertahankan outputUrl.
   */
  save: async (session: unknown) => {
    const plain = toPlain(session)
    await put(STORES.SESSIONS, plain)

    try {
      await $fetch('/api/sessions', {
        method: 'POST',
        body: plain,
      }).catch(() => {})
    } catch {
      // Offline
    }
  },

  get: async (id: string) => {
    const s = await getByKey<{ id: string; outputUrl?: string | null; [key: string]: unknown }>(STORES.SESSIONS, id)
    if (s && !s.outputUrl) {
      const blobOutput = await sessionPhotosDB.getDataUrl(id, -1)
      if (blobOutput) {
        s.outputUrl = blobOutput
      } else {
        const firstPhoto = await sessionPhotosDB.getDataUrl(id, 0)
        if (firstPhoto) s.outputUrl = firstPhoto
      }
    }
    return s
  },

  getAll: async () => {
    const localSessions = await getAll<{ id: string; outputUrl?: string | null; [key: string]: unknown }>(STORES.SESSIONS).catch(() => [])
    let resultList = localSessions

    try {
      const serverSessions = await $fetch<{ id: string; outputUrl?: string | null; [key: string]: unknown }[]>('/api/sessions').catch(() => null)
      if (serverSessions && Array.isArray(serverSessions)) {
        const serverIds = new Set(serverSessions.map(s => s.id))

        // Background sync: push local sessions not yet recorded on server
        const pendingLocal = localSessions.filter(s => s && s.id && !serverIds.has(s.id))
        for (const local of pendingLocal) {
          $fetch('/api/sessions', {
            method: 'POST',
            body: toPlain(local),
          }).catch(() => {})
        }

        // Upsert server sessions into local IndexedDB without wiping local state
        try {
          const db    = await openDB()
          const tx    = db.transaction(STORES.SESSIONS, 'readwrite')
          const store = tx.objectStore(STORES.SESSIONS)
          for (const s of serverSessions) {
            store.put(toPlain(s))
          }
        } catch {
          // Ignore local storage error
        }
        resultList = [...serverSessions, ...pendingLocal]
      }
    } catch {
      // Offline fallback
    }

    // Hydrate outputUrl from sessionPhotosDB Blob store if missing
    await Promise.all(resultList.map(async (s) => {
      if (!s.outputUrl) {
        const blobOutput = await sessionPhotosDB.getDataUrl(s.id, -1)
        if (blobOutput) {
          s.outputUrl = blobOutput
        } else {
          const firstPhoto = await sessionPhotosDB.getDataUrl(s.id, 0)
          if (firstPhoto) s.outputUrl = firstPhoto
        }
      }
    }))

    return resultList
  },
  delete: async (id: string) => {
    await deleteByKey(STORES.SESSIONS, id)
    await sessionPhotosDB.deleteForSession(id).catch(() => {})
    try {
      await $fetch(`/api/sessions/${id}`, { method: 'DELETE' }).catch(() => {})
    } catch {
      // Offline
    }
  },
  clearToday: async () => {
    const all = await getAll<{ id: string; startedAt?: string }>(STORES.SESSIONS)
    const todayStr  = new Date().toISOString().slice(0, 10)
    const todayIds  = all.filter(s => s.startedAt?.startsWith(todayStr)).map(s => s.id)

    try {
      await $fetch('/api/sessions/clear-today', { method: 'POST' }).catch(() => {})
    } catch {
      // Offline
    }

    for (const id of todayIds) {
      await deleteByKey(STORES.SESSIONS, id)
    }
    await sessionPhotosDB.deleteForSessionIds(todayIds).catch(() => {})
  },
  clearAll: async () => {
    try {
      await $fetch('/api/sessions/clear-all', { method: 'POST' }).catch(() => {})
    } catch {
      // Offline
    }
    _memStores.sessions.clear()
    try {
      const db = await openDB()
      await new Promise<void>((resolve, reject) => {
        const tx  = db.transaction(STORES.SESSIONS, 'readwrite')
        const req = tx.objectStore(STORES.SESSIONS).clear()
        req.onsuccess = () => resolve()
        req.onerror   = () => reject(req.error)
      })
    } catch {}
    await sessionPhotosDB.clearAll().catch(() => {})
  },
}

// ─── Print Jobs ───────────────────────────────────────────────
export const printJobsDB = {
  save:   (job: unknown) => put(STORES.PRINT_JOBS, job),
  get:    (id: string)   => getByKey(STORES.PRINT_JOBS, id),
  getAll: ()             => getAll(STORES.PRINT_JOBS),
}

// ─── System Logs ──────────────────────────────────────────────
export const logsDB = {
  async add(log: Omit<SystemLog, 'id'>): Promise<void> {
    const entry: SystemLog = {
      ...toPlain(log),
      id: Date.now() + Math.floor(Math.random() * 1000),
    }
    _memStores.system_logs.push(entry)
    if (_memStores.system_logs.length > 500) {
      _memStores.system_logs.shift()
    }

    try {
      const db    = await openDB()
      const plain = toPlain(log)
      await new Promise<void>((resolve, reject) => {
        const tx  = db.transaction(STORES.SYSTEM_LOGS, 'readwrite')
        const req = tx.objectStore(STORES.SYSTEM_LOGS).add(plain)
        req.onsuccess = () => resolve()
        req.onerror   = () => reject(req.error)
      })
    } catch {
      // Silent in-memory storage fallback
    }
  },

  getAll:  ()           => getAll<SystemLog>(STORES.SYSTEM_LOGS),
  delete:  (id: number) => {
    const idx = _memStores.system_logs.findIndex(l => l.id === id)
    if (idx !== -1) _memStores.system_logs.splice(idx, 1)
    return deleteByKey(STORES.SYSTEM_LOGS, id)
  },
}

// ─── Templates ────────────────────────────────────────────────
export const templatesDB = {
  save:   (tpl: unknown) => put(STORES.TEMPLATES, tpl),
  get:    (id: string)   => getByKey(STORES.TEMPLATES, id),
  getAll: ()             => getAll(STORES.TEMPLATES),
  delete: (id: string)   => deleteByKey(STORES.TEMPLATES, id),
}
