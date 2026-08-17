import { defineStore } from 'pinia'
import {
  type Session,
  type SessionState,
  type PrintJob,
  type PrintJobStatus,
  createSession,
  canTransition,
  generatePrintJobId,
} from '~/types/session'
import { sessionsDB, printJobsDB, logsDB, settingsDB } from '~/services/db'

interface SessionStoreState {
  current: Session | null
  history: Session[]
  printQueue: PrintJob[]
  isLoading: boolean
  error: string | null
  configuredShots: number
  configuredCountdown: number
}

export const useSessionStore = defineStore('session', {
  state: (): SessionStoreState => ({
    current:             null,
    history:             [],
    printQueue:          [],
    isLoading:           false,
    error:               null,
    configuredShots:     3,
    configuredCountdown: 5,
  }),

  getters: {
    sessionState:    (s) => s.current?.state ?? 'IDLE',
    currentShot:     (s) => s.current?.currentShot ?? 0,
    totalShots:      (s) => s.current?.totalShots ?? 3,
    photos:          (s) => s.current?.photos ?? [],
    capturedCount:   (s) => s.current?.photos.filter(p => p.dataUrl !== null).length ?? 0,
    allCaptured:     (s) => s.current !== null && s.current.photos.every(p => p.dataUrl !== null),
    pendingPrintJobs:(s) => s.printQueue.filter(j => ['QUEUED', 'PRINTING', 'RETRYING'].includes(j.status)),
  },

  actions: {
    // ─── State Machine ────────────────────────────────────────
    async transition(to: SessionState): Promise<boolean> {
      if (!this.current) return false
      const from = this.current.state

      if (!canTransition(from, to)) {
        console.warn(`[Session] Invalid transition: ${from} → ${to}`)
        return false
      }

      this.current.state = to

      await this._log('info', 'session', `session.${to.toLowerCase()}`, `Transitioned ${from} → ${to}`)
      await this._persist()
      return true
    },

    // ─── Start new session ────────────────────────────────────
    async startSession(options: { totalShots?: number; templateId?: string | null; eventName?: string | null } = {}) {
      if (!options.eventName) {
        const dbEvent    = await settingsDB.get<string>('activeEventName')
        const localEvent = typeof localStorage !== 'undefined' ? localStorage.getItem('photobooth_event_name') : null
        options.eventName = dbEvent || localEvent || 'RD Photobooth'
        if (typeof localStorage !== 'undefined' && options.eventName) {
          localStorage.setItem('photobooth_event_name', options.eventName)
        }
      }

      const session = createSession(options)
      session.state = 'READY'
      this.current  = session
      this.error    = null

      await this._persist()
      await this._log('info', 'session', 'session.started', `New session ${session.id} started for event "${session.eventName}"`)
    },

    // ─── Ready State ──────────────────────────────────────────
    async ready() {
      if (!this.current) return
      if (this.current.state === 'IDLE') {
        await this.transition('READY')
      }
    },

    // ─── Countdown ────────────────────────────────────────────
    async startCountdown() {
      await this.transition('COUNTDOWN')
    },

    // ─── Capture photo ────────────────────────────────────────
    async capturePhoto(dataUrl: string) {
      if (!this.current) return

      await this.transition('CAPTURE')

      const slot = this.current.photos[this.current.currentShot]
      if (slot) {
        slot.dataUrl    = dataUrl
        slot.capturedAt = new Date().toISOString()
      }

      await this._log('info', 'camera', 'camera.capture.completed', `Shot ${this.current.currentShot + 1}/${this.current.totalShots} captured`)

      const nextShot = this.current.currentShot + 1

      if (nextShot < this.current.totalShots) {
        // More shots needed → return to READY so user can manually trigger next shot
        this.current.currentShot = nextShot
        await this.transition('READY')
      } else {
        // All shots done → process
        await this.transition('PROCESSING')
      }

      await this._persist()
    },

    // ─── Retake individual shot ───────────────────────────────
    async retakeShot(shotIndex?: number) {
      if (!this.current) return
      const targetIdx = shotIndex !== undefined ? shotIndex : Math.max(0, this.current.currentShot - 1)
      this.current.currentShot = targetIdx
      if (this.current.photos[targetIdx]) {
        this.current.photos[targetIdx].dataUrl = null
        this.current.photos[targetIdx].capturedAt = null
      }
      this.current.state = 'READY'
      await this._persist()
      await this._log('info', 'session', 'session.retake_shot', `Retaking shot ${targetIdx + 1}`)
    },

    // ─── Processing done ──────────────────────────────────────
    async setOutput(outputUrl: string) {
      if (!this.current) return
      this.current.outputUrl = outputUrl
      await this.transition('PREVIEW')
      await this._persist()
    },

    // ─── Set customer details ─────────────────────────────────
    async setCustomerInfo(name: string, email: string) {
      if (!this.current) return
      this.current.customerName  = name.trim() || null
      this.current.customerEmail = email.trim() || null
      await this._persist()
      await this._log('info', 'session', 'session.customer_saved', `Customer info saved: ${name} (${email})`)
    },

    // ─── Start print ──────────────────────────────────────────
    async enqueuePrint(copies = 1): Promise<PrintJob | null> {
      if (!this.current?.outputUrl) return null

      await this.transition('PRINT')

      const job: PrintJob = {
        id:           generatePrintJobId(),
        sessionId:    this.current.id,
        filePath:     this.current.outputUrl,
        printerId:    null,
        copies,
        status:       'QUEUED',
        createdAt:    new Date().toISOString(),
        startedAt:    null,
        completedAt:  null,
        errorMessage: null,
        retryCount:   0,
      }

      this.current.printJobId = job.id
      this.printQueue.push(job)

      await printJobsDB.save(job)
      await this._log('info', 'printer', 'print.queued', `Job ${job.id} queued for session ${this.current.id}`)
      await this._persist()

      return job
    },

    async updatePrintJob(id: string, updates: Partial<PrintJob>) {
      const job = this.printQueue.find(j => j.id === id)
      if (!job) return
      Object.assign(job, updates)
      await printJobsDB.save(job)
    },

    // ─── Finish session ───────────────────────────────────────
    async finishSession() {
      if (!this.current) return
      if (!this.current.eventName) {
        this.current.eventName = (await settingsDB.get<string>('activeEventName')) || null
      }
      this.current.completedAt = new Date().toISOString()
      await this.transition('DONE')

      // Archive to history
      this.history.unshift({ ...this.current })
      await this._persist()
      await this._log('info', 'session', 'session.completed', `Session ${this.current.id} completed`)
    },

    // ─── Reset to idle ────────────────────────────────────────
    async resetSession() {
      if (this.current) {
        await this._log('info', 'session', 'session.reset', `Session ${this.current.id} manually reset`)
      }
      this.current = null
      this.error   = null
    },

    // ─── Delete session ──────────────────────────────────────
    async deleteSession(id: string) {
      await sessionsDB.delete(id)
      this.history = this.history.filter(s => s.id !== id)
      await this._log('info', 'session', 'session.deleted', `Session ${id} deleted`)
    },

    // ─── Reprint from history ─────────────────────────────────
    async reprintSession(sessionId: string, copies = 1): Promise<PrintJob | null> {
      const session = this.history.find(s => s.id === sessionId)
      if (!session || !session.outputUrl) return null

      const job: PrintJob = {
        id:           generatePrintJobId(),
        sessionId:    session.id,
        filePath:     session.outputUrl,
        printerId:    null,
        copies,
        status:       'QUEUED',
        createdAt:    new Date().toISOString(),
        startedAt:    null,
        completedAt:  null,
        errorMessage: null,
        retryCount:   0,
      }

      this.printQueue.push(job)
      await printJobsDB.save(job)
      await this._log('info', 'printer', 'print.reprint_queued', `Reprint job ${job.id} queued for session ${session.id}`)
      return job
    },

    // ─── Clear Sessions ──────────────────────────────────────
    async clearTodaySessions() {
      await sessionsDB.clearToday()
      await this.loadHistory()
      await this._log('warn', 'session', 'session.cleared_today', 'All sessions from today cleared by operator')
    },

    async clearAllSessions() {
      await sessionsDB.clearAll()
      this.history = []
      this.current = null
      await this._log('warn', 'session', 'session.cleared_all', 'All session history cleared by operator')
    },

    // ─── Load history from DB ─────────────────────────────────
    async loadHistory(silent = false) {
      if (!silent && this.history.length === 0) {
        this.isLoading = true
      }
      try {
        const all = await sessionsDB.getAll() as Session[]
        const sorted = all.sort((a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        )

        const hasChanged = sorted.length !== this.history.length ||
          sorted.some((s, i) => s.id !== this.history[i]?.id || s.outputUrl !== this.history[i]?.outputUrl)

        if (hasChanged || this.history.length === 0) {
          this.history = sorted
        }
      } finally {
        this.isLoading = false
      }
    },

    // ─── Load admin rules & default settings ─────────────────
    async loadAdminSettings() {
      try {
        const serverSettings = await $fetch<Record<string, unknown>>('/api/settings').catch(() => null)
        if (serverSettings) {
          if (typeof serverSettings.lastTotalShots === 'number') {
            this.configuredShots = serverSettings.lastTotalShots
          }
          if (typeof serverSettings.activeCountdown === 'number') {
            this.configuredCountdown = serverSettings.activeCountdown
          }
          return serverSettings
        }
      } catch {
        // Offline
      }

      const savedShots = await settingsDB.get<number>('lastTotalShots')
      if (typeof savedShots === 'number') {
        this.configuredShots = savedShots
      }

      const savedCd = await settingsDB.get<number>('activeCountdown')
      if (typeof savedCd === 'number') {
        this.configuredCountdown = savedCd
      }
      return null
    },

    // ─── Internal helpers ─────────────────────────────────────
    // db.ts toPlain() handles reactive proxy stripping automatically
    async _persist() {
      if (this.current) {
        await sessionsDB.save(this.current)
      }
    },

    async _log(level: 'info' | 'warn' | 'error', module: string, event: string, message: string) {
      const entry = {
        timestamp: new Date().toISOString(),
        level,
        module,
        event,
        message,
      }
      console.log(`[${level.toUpperCase()}] ${module} — ${message}`)
      await logsDB.add(entry)
    },
  },
})
