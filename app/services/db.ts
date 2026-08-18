/**
 * IndexedDB Service
 * Local-first persistence untuk sessions, templates, settings, print jobs, dan logs.
 */

const DB_NAME    = 'photobooth-db'
const DB_VERSION = 1

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

// ─── Store names ──────────────────────────────────────────────
const STORES = {
  SETTINGS:      'settings',
  SESSIONS:      'sessions',
  SESSION_PHOTOS:'session_photos',
  PRINT_JOBS:    'print_jobs',
  TEMPLATES:     'templates',
  SYSTEM_LOGS:   'system_logs',
} as const

let _db: IDBDatabase | null = null

// ─── Open DB ──────────────────────────────────────────────────
export function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db)

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

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

      // session_photos
      if (!db.objectStoreNames.contains(STORES.SESSION_PHOTOS)) {
        const s = db.createObjectStore(STORES.SESSION_PHOTOS, { keyPath: 'id', autoIncrement: true })
        s.createIndex('sessionId', 'sessionId', { unique: false })
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

    req.onsuccess  = () => { _db = req.result; resolve(_db) }
    req.onerror    = () => reject(req.error)
  })
}

// ─── Generic CRUD helpers ─────────────────────────────────────

/** Strip Vue reactive Proxy and produce a plain, IDB-serializable object */
function toPlain<T>(record: T): T {
  return JSON.parse(JSON.stringify(record)) as T
}

async function put<T>(storeName: string, record: T): Promise<T> {
  const db    = await openDB()
  const plain = toPlain(record)
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(storeName, 'readwrite')
    const req = tx.objectStore(storeName).put(plain)
    req.onsuccess = () => resolve(plain)
    req.onerror   = () => reject(req.error)
  })
}

async function getByKey<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
  const db   = await openDB()
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).get(key)
    req.onsuccess = () => resolve(req.result as T | undefined)
    req.onerror   = () => reject(req.error)
  })
}

async function getAll<T>(storeName: string): Promise<T[]> {
  const db   = await openDB()
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).getAll()
    req.onsuccess = () => resolve(req.result as T[])
    req.onerror   = () => reject(req.error)
  })
}

async function deleteByKey(storeName: string, key: IDBValidKey): Promise<void> {
  const db   = await openDB()
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(storeName, 'readwrite')
    const req = tx.objectStore(storeName).delete(key)
    req.onsuccess = () => resolve()
    req.onerror   = () => reject(req.error)
  })
}

// ─── Settings ────────────────────────────────────────────────
export const settingsDB = {
  async get<T = unknown>(key: string): Promise<T | undefined> {
    try {
      // Try to fetch from central server API first
      const serverSettings = await $fetch<Record<string, unknown>>('/api/settings').catch(() => null)
      if (serverSettings && key in serverSettings) {
        return serverSettings[key] as T
      }
    } catch {
      // Offline fallback to IndexedDB
    }

    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(STORES.SETTINGS, 'readonly')
      const req = tx.objectStore(STORES.SETTINGS).index('key').get(key)
      req.onsuccess = () => resolve(req.result?.value as T | undefined)
      req.onerror   = () => reject(req.error)
    })
  },

  async set(key: string, value: unknown): Promise<void> {
    // Send to central server API
    try {
      await $fetch('/api/settings', {
        method: 'POST',
        body: { [key]: value },
      }).catch(() => {})
    } catch {
      // Ignore if offline
    }

    const db = await openDB()
    return new Promise((resolve, reject) => {
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
        putReq.onerror   = () => reject(putReq.error)
      }
      req.onerror = () => reject(req.error)
    })
  },
}

// ─── Sessions ─────────────────────────────────────────────────
export const sessionsDB = {
  save: async (session: unknown) => {
    await put(STORES.SESSIONS, session)
    try {
      await $fetch('/api/sessions', {
        method: 'POST',
        body: session,
      }).catch(() => {})
    } catch {
      // Offline
    }
  },
  get: (id: string) => getByKey(STORES.SESSIONS, id),
  getAll: async () => {
    const localSessions = await getAll<{ id: string; [key: string]: unknown }>(STORES.SESSIONS).catch(() => [])
    try {
      const serverSessions = await $fetch<{ id: string; [key: string]: unknown }[]>('/api/sessions').catch(() => null)
      if (serverSessions && Array.isArray(serverSessions)) {
        const serverIds = new Set(serverSessions.map(s => s.id))

        // Background sync: push local sessions not yet recorded on server
        const pendingLocal = localSessions.filter(s => s && s.id && !serverIds.has(s.id))
        for (const local of pendingLocal) {
          $fetch('/api/sessions', {
            method: 'POST',
            body: local,
          }).catch(() => {})
        }

        // Upsert server sessions into local IndexedDB without wiping local state
        try {
          const db = await openDB()
          const tx = db.transaction(STORES.SESSIONS, 'readwrite')
          const store = tx.objectStore(STORES.SESSIONS)
          for (const s of serverSessions) {
            store.put(toPlain(s))
          }
        } catch {
          // Ignore local storage error
        }
        return [...serverSessions, ...pendingLocal]
      }
    } catch {
      // Offline fallback
    }
    return localSessions
  },
  delete: async (id: string) => {
    await deleteByKey(STORES.SESSIONS, id)
    try {
      await $fetch(`/api/sessions/${id}`, { method: 'DELETE' }).catch(() => {})
    } catch {
      // Offline
    }
  },
  clearToday: async () => {
    try {
      await $fetch('/api/sessions/clear-today', { method: 'POST' }).catch(() => {})
    } catch {
      // Offline
    }
    const all = await getAll<{ id: string; startedAt?: string }>(STORES.SESSIONS)
    const todayStr = new Date().toISOString().slice(0, 10)
    for (const s of all) {
      if (s.startedAt?.startsWith(todayStr)) {
        await deleteByKey(STORES.SESSIONS, s.id)
      }
    }
  },
  clearAll: async () => {
    try {
      await $fetch('/api/sessions/clear-all', { method: 'POST' }).catch(() => {})
    } catch {
      // Offline
    }
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SESSIONS, 'readwrite')
      const req = tx.objectStore(STORES.SESSIONS).clear()
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
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
    const db    = await openDB()
    const plain = toPlain(log)
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(STORES.SYSTEM_LOGS, 'readwrite')
      const req = tx.objectStore(STORES.SYSTEM_LOGS).add(plain)
      req.onsuccess = () => resolve()
      req.onerror   = () => reject(req.error)
    })
  },

  getAll:  ()              => getAll<SystemLog>(STORES.SYSTEM_LOGS),
  delete:  (id: number)    => deleteByKey(STORES.SYSTEM_LOGS, id),
}

// ─── Templates ────────────────────────────────────────────────
export const templatesDB = {
  save:   (tpl: unknown) => put(STORES.TEMPLATES, tpl),
  get:    (id: string)   => getByKey(STORES.TEMPLATES, id),
  getAll: ()             => getAll(STORES.TEMPLATES),
  delete: (id: string)   => deleteByKey(STORES.TEMPLATES, id),
}
