/**
 * Session State Machine
 * Sesuai arsitektur: IDLE → READY → COUNTDOWN → CAPTURE → PROCESSING → PREVIEW → PRINT → DONE → READY
 */

export type SessionState =
  | 'IDLE'
  | 'READY'
  | 'COUNTDOWN'
  | 'CAPTURE'
  | 'PROCESSING'
  | 'PREVIEW'
  | 'PRINT'
  | 'DONE'

export type PrintJobStatus =
  | 'QUEUED'
  | 'PRINTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'RETRYING'
  | 'CANCELLED'

export interface PhotoSlot {
  index: number
  dataUrl: string | null
  capturedAt: string | null
}

export interface Session {
  id: string
  state: SessionState
  templateId: string | null
  eventName: string | null
  photos: PhotoSlot[]
  totalShots: number
  currentShot: number
  outputUrl: string | null
  customerName: string | null
  customerEmail: string | null
  startedAt: string
  completedAt: string | null
  error: string | null
}

export interface PrintJob {
  id: string
  sessionId: string
  filePath: string | null
  printerId: string | null
  copies: number
  status: PrintJobStatus
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  errorMessage: string | null
  retryCount: number
}

/** Valid transitions from each state */
const TRANSITIONS: Record<SessionState, SessionState[]> = {
  IDLE:       ['READY'],
  READY:      ['COUNTDOWN', 'IDLE'],
  COUNTDOWN:  ['CAPTURE', 'READY'],
  CAPTURE:    ['READY', 'COUNTDOWN', 'PROCESSING'],
  PROCESSING: ['PREVIEW'],
  PREVIEW:    ['DONE', 'PRINT', 'READY'],
  PRINT:      ['DONE'],
  DONE:       ['READY', 'IDLE'],
}

export function canTransition(from: SessionState, to: SessionState): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false
}

export function generateSessionId(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `SES-${date}-${rand}`
}

export function generatePrintJobId(): string {
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase()
  return `PJ-${rand}`
}

export function createSession(options: {
  totalShots?: number
  templateId?: string | null
  eventName?: string | null
} = {}): Session {
  const totalShots = options.totalShots ?? 3
  return {
    id: generateSessionId(),
    state: 'IDLE',
    templateId: options.templateId ?? null,
    eventName: options.eventName ?? null,
    photos: Array.from({ length: totalShots }, (_, i) => ({
      index: i,
      dataUrl: null,
      capturedAt: null,
    })),
    totalShots,
    currentShot: 0,
    outputUrl: null,
    customerName: null,
    customerEmail: null,
    startedAt: new Date().toISOString(),
    completedAt: null,
    error: null,
  }
}
