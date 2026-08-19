import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import type { PhotoTemplate, TemplateElement } from '~/types/template'
import { templatesDB } from '~/services/db'
import { PRESET_TEMPLATES } from '~/services/presets'

interface TemplateStoreState {
  templates:  PhotoTemplate[]
  active:     PhotoTemplate | null
  selected:   string | null   // selected element id in editor
  isLoading:  boolean
}

export const useTemplateStore = defineStore('template', {
  state: (): TemplateStoreState => ({
    templates: [...PRESET_TEMPLATES],
    active:    null,
    selected:  null,
    isLoading: false,
  }),

  getters: {
    selectedElement: (s): TemplateElement | null =>
      s.active?.elements.find(e => e.id === s.selected) ?? null,

    sortedElements: (s) => s.active?.elements ?? [],

    hasActive: (s) => s.active !== null,
  },

  actions: {
    // ─── Load ─────────────────────────────────────────────────
    async loadTemplates() {
      // Jika templates kosong, inisialisasi awal dengan PRESET_TEMPLATES agar UI tidak blank
      if (this.templates.length === 0) {
        this.templates = [...PRESET_TEMPLATES]
      }
      this.isLoading = true
      try {
        const saved = await templatesDB.getAll().catch((err) => {
          console.warn('[TemplateStore] IndexedDB getAll failed, using presets:', err)
          return []
        }) as PhotoTemplate[]

        const map = new Map<string, PhotoTemplate>()
        // Always load latest code presets
        PRESET_TEMPLATES.forEach(t => map.set(t.id, t))
        // Load user-created custom templates
        if (Array.isArray(saved)) {
          saved.filter(t => t && t.id && !t.id.startsWith('preset-')).forEach(t => map.set(t.id, t))
        }
        this.templates = [...map.values()]
      } catch (err) {
        console.error('[TemplateStore] loadTemplates error:', err)
        this.templates = [...PRESET_TEMPLATES]
      } finally {
        this.isLoading = false
      }
    },

    // ─── Activate ─────────────────────────────────────────────
    setActive(templateOrId: PhotoTemplate | string) {
      const tpl = typeof templateOrId === 'string'
        ? this.templates.find(t => t.id === templateOrId)
        : templateOrId
      if (tpl) {
        // Deep clone to avoid mutating original
        this.active   = JSON.parse(JSON.stringify(tpl))
        this.selected = null
      }
    },

    clearActive() {
      this.active   = null
      this.selected = null
    },

    // ─── Selection ────────────────────────────────────────────
    selectElement(id: string | null) {
      this.selected = id
    },

    // ─── Element mutation ─────────────────────────────────────
    updateElement(id: string, updates: Partial<TemplateElement>) {
      if (!this.active) return
      const idx = this.active.elements.findIndex(e => e.id === id)
      if (idx < 0) return
      Object.assign(this.active.elements[idx], updates)
      this.active.updatedAt = new Date().toISOString()
    },

    addElement(el: TemplateElement) {
      if (!this.active) return
      this.active.elements.push(el)
      this.selected = el.id
    },

    removeElement(id: string) {
      if (!this.active) return
      this.active.elements = this.active.elements.filter(e => e.id !== id)
      if (this.selected === id) this.selected = null
    },

    duplicateElement(id: string) {
      if (!this.active) return
      const el = this.active.elements.find(e => e.id === id)
      if (!el) return
      const clone = JSON.parse(JSON.stringify(el))
      clone.id = Math.random().toString(36).slice(2, 10)
      clone.x += 20
      clone.y += 20
      clone.name += ' (copy)'
      this.active.elements.push(clone)
      this.selected = clone.id
    },

    // ─── Layer ordering ───────────────────────────────────────
    moveLayer(id: string, direction: 'up' | 'down' | 'top' | 'bottom') {
      if (!this.active) return
      const els = this.active.elements
      const idx = els.findIndex(e => e.id === id)
      if (idx < 0) return

      const el = els.splice(idx, 1)[0]
      if (direction === 'top')    els.push(el)
      else if (direction === 'bottom') els.unshift(el)
      else if (direction === 'up')   els.splice(Math.min(idx + 1, els.length), 0, el)
      else if (direction === 'down') els.splice(Math.max(idx - 1, 0), 0, el)
    },

    // ─── Canvas settings ──────────────────────────────────────
    updateCanvas(updates: Partial<PhotoTemplate['canvas']>) {
      if (!this.active) return
      Object.assign(this.active.canvas, updates)
    },

    updateTemplateMeta(updates: { name?: string; description?: string }) {
      if (!this.active) return
      Object.assign(this.active, updates)
    },

    // ─── Save / Delete ────────────────────────────────────────
    async saveTemplate() {
      if (!this.active) return
      this.active.updatedAt = new Date().toISOString()
      const plain = JSON.parse(JSON.stringify(toRaw(this.active)))
      await templatesDB.save(plain)
      // Update local list
      const idx = this.templates.findIndex(t => t.id === this.active!.id)
      if (idx >= 0) this.templates[idx] = { ...plain }
      else          this.templates.push({ ...plain })
    },

    async deleteTemplate(id: string) {
      await templatesDB.delete(id)
      this.templates = this.templates.filter(t => t.id !== id)
      if (this.active?.id === id) this.clearActive()
    },

    // ─── Generate thumbnail ───────────────────────────────────
    async generateThumbnail(photos: Record<number, string>): Promise<string> {
      if (!this.active) return ''
      const { renderTemplate } = await import('~/services/renderer')
      const result = await renderTemplate(this.active, { photos, scale: 0.15 })
      return result.dataUrl
    },
  },
})
