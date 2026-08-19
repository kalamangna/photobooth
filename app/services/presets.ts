/**
 * Preset Templates
 * Koleksi template photobooth bawaan dengan variasi layout & aesthetic modern.
 */
import type { PhotoTemplate } from '~/types/template'

function now() { return new Date().toISOString() }

// ─────────────────────────────────────────────────────────────
// 1. Classic 2×6 Strip - White Clean (3 Foto Vertikal)
// Print size: 2" × 6" @ 300dpi = 600 × 1800 px
// ─────────────────────────────────────────────────────────────
export const TEMPLATE_STRIP_2X6_WHITE: PhotoTemplate = {
  id:          'preset-strip-2x6-white',
  name:        'Classic White Strip',
  description: 'Strip photobooth klasik warna putih bersih, 3 foto vertikal',
  category:    'strip',
  totalSlots:  3,
  canvas: { width: 600, height: 1800, background: '#fdfdfd', dpi: 300 },
  elements: [
    {
      id: 'p0', type: 'photo', name: 'Foto 1',
      slot: 0, fit: 'cover', borderRadius: 4, flipH: false, flipV: false,
      x: 32, y: 36, width: 536, height: 480,
      rotation: 0, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'p1', type: 'photo', name: 'Foto 2',
      slot: 1, fit: 'cover', borderRadius: 4, flipH: false, flipV: false,
      x: 32, y: 540, width: 536, height: 480,
      rotation: 0, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'p2', type: 'photo', name: 'Foto 3',
      slot: 2, fit: 'cover', borderRadius: 4, flipH: false, flipV: false,
      x: 32, y: 1044, width: 536, height: 480,
      rotation: 0, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'txt-event', type: 'text', name: 'Nama Acara',
      text: 'RD Photobooth',
      fontFamily: 'Inter', fontSize: 26, fontWeight: '700', fontStyle: 'normal',
      color: '#1a1a1a', textAlign: 'center', lineHeight: 1.2, letterSpacing: 2, padding: 0,
      x: 32, y: 1560, width: 536, height: 38,
      rotation: 0, opacity: 0.95, visible: true, locked: false,
    },
    {
      id: 'txt-date', type: 'text', name: 'Tanggal',
      text: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      fontFamily: 'Inter', fontSize: 18, fontWeight: '400', fontStyle: 'normal',
      color: '#777777', textAlign: 'center', lineHeight: 1.2, letterSpacing: 1, padding: 0,
      x: 32, y: 1608, width: 536, height: 28,
      rotation: 0, opacity: 0.8, visible: true, locked: false,
    },
    {
      id: 'txt-brand', type: 'text', name: 'Branding Footer',
      text: 'RD PHOTOBOOTH',
      fontFamily: 'Inter', fontSize: 13, fontWeight: '600', fontStyle: 'normal',
      color: '#aaaaaa', textAlign: 'center', lineHeight: 1.2, letterSpacing: 3, padding: 0,
      x: 32, y: 1648, width: 536, height: 24,
      rotation: 0, opacity: 0.85, visible: true, locked: false,
    },
  ],
  createdAt: now(), updatedAt: now(),
}

// ─────────────────────────────────────────────────────────────
// 2. Midnight Dark Strip (3 Foto Vertikal - Nuansa Gelap)
// Size: 600 × 1800 px
// ─────────────────────────────────────────────────────────────
export const TEMPLATE_STRIP_2X6_DARK: PhotoTemplate = {
  id:          'preset-strip-2x6-dark',
  name:        'Midnight Noir Strip',
  description: 'Strip hitam elegan dengan aksen amber emas',
  category:    'strip',
  totalSlots:  3,
  canvas: { width: 600, height: 1800, background: '#0d0d0d', dpi: 300 },
  elements: [
    {
      id: 'frame-border', type: 'shape', name: 'Border Frame',
      shape: 'rect', fill: 'transparent', stroke: 'rgba(255,255,255,0.08)', strokeWidth: 2, borderRadius: 8,
      x: 16, y: 16, width: 568, height: 1768,
      rotation: 0, opacity: 1, visible: true, locked: true,
    },
    {
      id: 'p0', type: 'photo', name: 'Foto 1',
      slot: 0, fit: 'cover', borderRadius: 4, flipH: false, flipV: false,
      x: 36, y: 40, width: 528, height: 470,
      rotation: 0, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'p1', type: 'photo', name: 'Foto 2',
      slot: 1, fit: 'cover', borderRadius: 4, flipH: false, flipV: false,
      x: 36, y: 536, width: 528, height: 470,
      rotation: 0, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'p2', type: 'photo', name: 'Foto 3',
      slot: 2, fit: 'cover', borderRadius: 4, flipH: false, flipV: false,
      x: 36, y: 1032, width: 528, height: 470,
      rotation: 0, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'txt-event', type: 'text', name: 'Nama Acara',
      text: 'RD Photobooth',
      fontFamily: 'Inter', fontSize: 24, fontWeight: '600', fontStyle: 'normal',
      color: '#f59e0b', textAlign: 'center', lineHeight: 1.2, letterSpacing: 2, padding: 0,
      x: 36, y: 1545, width: 528, height: 38,
      rotation: 0, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'txt-date', type: 'text', name: 'Tanggal',
      text: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase(),
      fontFamily: 'Inter', fontSize: 16, fontWeight: '400', fontStyle: 'normal',
      color: '#888888', textAlign: 'center', lineHeight: 1.2, letterSpacing: 2, padding: 0,
      x: 36, y: 1592, width: 528, height: 26,
      rotation: 0, opacity: 0.8, visible: true, locked: false,
    },
    {
      id: 'txt-brand', type: 'text', name: 'Branding Footer',
      text: 'RD PHOTOBOOTH',
      fontFamily: 'Inter', fontSize: 12, fontWeight: '600', fontStyle: 'normal',
      color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.2, letterSpacing: 3, padding: 0,
      x: 36, y: 1630, width: 528, height: 22,
      rotation: 0, opacity: 0.85, visible: true, locked: false,
    },
  ],
  createdAt: now(), updatedAt: now(),
}

// ─── Registry ─────────────────────────────────────────────────
export const PRESET_TEMPLATES: PhotoTemplate[] = [
  TEMPLATE_STRIP_2X6_WHITE,
  TEMPLATE_STRIP_2X6_DARK,
]

export function getPreset(id: string): PhotoTemplate | undefined {
  return PRESET_TEMPLATES.find(t => t.id === id)
}
