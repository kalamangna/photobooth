import fs from 'node:fs'
import path from 'node:path'

const DATA_DIR = path.resolve(process.cwd(), '.data')

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function readJSON<T>(filename: string, fallback: T): T {
  ensureDir()
  const filePath = path.join(DATA_DIR, filename)
  if (!fs.existsSync(filePath)) {
    return fallback
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJSON<T>(filename: string, data: T): void {
  ensureDir()
  const filePath = path.join(DATA_DIR, filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}
