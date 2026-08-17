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
      id: 'txt-brand', type: 'text', name: 'Brand Header',
      text: 'RD Photobooth',
      fontFamily: 'Inter', fontSize: 26, fontWeight: '700', fontStyle: 'normal',
      color: '#1a1a1a', textAlign: 'center', lineHeight: 1.2, letterSpacing: 2, padding: 0,
      x: 32, y: 1580, width: 536, height: 40,
      rotation: 0, opacity: 0.95, visible: true, locked: false,
    },
    {
      id: 'txt-date', type: 'text', name: 'Tanggal',
      text: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      fontFamily: 'Inter', fontSize: 20, fontWeight: '400', fontStyle: 'normal',
      color: '#777777', textAlign: 'center', lineHeight: 1.2, letterSpacing: 1, padding: 0,
      x: 32, y: 1630, width: 536, height: 35,
      rotation: 0, opacity: 0.8, visible: true, locked: false,
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
      id: 'txt-brand', type: 'text', name: 'Brand',
      text: 'RD Photobooth',
      fontFamily: 'Inter', fontSize: 26, fontWeight: '600', fontStyle: 'normal',
      color: '#f59e0b', textAlign: 'center', lineHeight: 1.2, letterSpacing: 3, padding: 0,
      x: 36, y: 1570, width: 528, height: 40,
      rotation: 0, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'txt-date', type: 'text', name: 'Date',
      text: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase(),
      fontFamily: 'Inter', fontSize: 18, fontWeight: '400', fontStyle: 'normal',
      color: '#888888', textAlign: 'center', lineHeight: 1.2, letterSpacing: 2, padding: 0,
      x: 36, y: 1620, width: 528, height: 30,
      rotation: 0, opacity: 0.8, visible: true, locked: false,
    },
  ],
  createdAt: now(), updatedAt: now(),
}

// ─────────────────────────────────────────────────────────────
// 3. 4-Photo Strip (4 Foto Vertikal - Classic 2x6)
// Size: 600 × 1800 px
// ─────────────────────────────────────────────────────────────
export const TEMPLATE_STRIP_4PHOTO: PhotoTemplate = {
  id:          'preset-strip-4photo',
  name:        '4-Shot Film Strip',
  description: 'Strip 4 foto vertikal dengan gaya cinematic',
  category:    'strip',
  totalSlots:  4,
  canvas: { width: 600, height: 1800, background: '#111111', dpi: 300 },
  elements: [
    {
      id: 'p0', type: 'photo', name: 'Foto 1',
      slot: 0, fit: 'cover', borderRadius: 4, flipH: false, flipV: false,
      x: 32, y: 32, width: 536, height: 380,
      rotation: 0, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'p1', type: 'photo', name: 'Foto 2',
      slot: 1, fit: 'cover', borderRadius: 4, flipH: false, flipV: false,
      x: 32, y: 432, width: 536, height: 380,
      rotation: 0, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'p2', type: 'photo', name: 'Foto 3',
      slot: 2, fit: 'cover', borderRadius: 4, flipH: false, flipV: false,
      x: 32, y: 832, width: 536, height: 380,
      rotation: 0, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'p3', type: 'photo', name: 'Foto 4',
      slot: 3, fit: 'cover', borderRadius: 4, flipH: false, flipV: false,
      x: 32, y: 1232, width: 536, height: 380,
      rotation: 0, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'txt-title', type: 'text', name: 'Film Tag',
      text: 'RD Photobooth',
      fontFamily: 'Inter', fontSize: 24, fontWeight: '700', fontStyle: 'normal',
      color: '#ffffff', textAlign: 'center', lineHeight: 1.2, letterSpacing: 2, padding: 0,
      x: 32, y: 1670, width: 536, height: 35,
      rotation: 0, opacity: 0.95, visible: true, locked: false,
    },
  ],
  createdAt: now(), updatedAt: now(),
}

// ─────────────────────────────────────────────────────────────
// 4. 4-Photo Studio Grid (2×2 Landscape 4" × 6")
// Size: 1800 × 1200 px
// ─────────────────────────────────────────────────────────────
export const TEMPLATE_GRID_4PHOTO: PhotoTemplate = {
  id:          'preset-grid-4photo',
  name:        'Studio 4-Grid',
  description: 'Susunan 4 foto 2×2 landscape modern minimalis',
  category:    'grid',
  totalSlots:  4,
  canvas: { width: 1800, height: 1200, background: '#ffffff', dpi: 300 },
  elements: [
    {
      id: 'p0', type: 'photo', name: 'Foto 1',
      slot: 0, fit: 'cover', borderRadius: 8, flipH: false, flipV: false,
      x: 36, y: 36, width: 846, height: 500,
      rotation: 0, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'p1', type: 'photo', name: 'Foto 2',
      slot: 1, fit: 'cover', borderRadius: 8, flipH: false, flipV: false,
      x: 918, y: 36, width: 846, height: 500,
      rotation: 0, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'p2', type: 'photo', name: 'Foto 3',
      slot: 2, fit: 'cover', borderRadius: 8, flipH: false, flipV: false,
      x: 36, y: 556, width: 846, height: 500,
      rotation: 0, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'p3', type: 'photo', name: 'Foto 4',
      slot: 3, fit: 'cover', borderRadius: 8, flipH: false, flipV: false,
      x: 918, y: 556, width: 846, height: 500,
      rotation: 0, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'txt-foot', type: 'text', name: 'Footer Text',
      text: 'RD Photobooth',
      fontFamily: 'Inter', fontSize: 26, fontWeight: '600', fontStyle: 'normal',
      color: '#444444', textAlign: 'center', lineHeight: 1.2, letterSpacing: 3, padding: 0,
      x: 36, y: 1110, width: 1728, height: 40,
      rotation: 0, opacity: 0.9, visible: true, locked: false,
    },
  ],
  createdAt: now(), updatedAt: now(),
}

// ─────────────────────────────────────────────────────────────
// 5. Polaroid Duo (2 Foto Berdampingan 4" × 6")
// Size: 1800 × 1200 px
// ─────────────────────────────────────────────────────────────
export const TEMPLATE_POLAROID_DUO: PhotoTemplate = {
  id:          'preset-polaroid-duo',
  name:        'Polaroid Duo',
  description: 'Dua frame polaroid vintage berdampingan untuk 2 foto',
  category:    'polaroid',
  totalSlots:  2,
  canvas: { width: 1800, height: 1200, background: '#f5f4f0', dpi: 300 },
  elements: [
    // Polaroid card 1
    {
      id: 'card1', type: 'shape', name: 'Kartu 1',
      shape: 'rect', fill: '#ffffff', stroke: 'rgba(0,0,0,0.06)', strokeWidth: 1, borderRadius: 8,
      x: 60, y: 60, width: 800, height: 1040,
      rotation: -1.5, opacity: 1, visible: true, locked: true,
    },
    {
      id: 'p0', type: 'photo', name: 'Foto 1',
      slot: 0, fit: 'cover', borderRadius: 4, flipH: false, flipV: false,
      x: 95, y: 95, width: 730, height: 800,
      rotation: -1.5, opacity: 1, visible: true, locked: false,
    },
    // Polaroid card 2
    {
      id: 'card2', type: 'shape', name: 'Kartu 2',
      shape: 'rect', fill: '#ffffff', stroke: 'rgba(0,0,0,0.06)', strokeWidth: 1, borderRadius: 8,
      x: 940, y: 60, width: 800, height: 1040,
      rotation: 1.5, opacity: 1, visible: true, locked: true,
    },
    {
      id: 'p1', type: 'photo', name: 'Foto 2',
      slot: 1, fit: 'cover', borderRadius: 4, flipH: false, flipV: false,
      x: 975, y: 95, width: 730, height: 800,
      rotation: 1.5, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'txt-duo', type: 'text', name: 'Duo Note',
      text: 'RD Photobooth',
      fontFamily: 'Inter', fontSize: 36, fontWeight: '400', fontStyle: 'italic',
      color: '#555555', textAlign: 'center', lineHeight: 1.2, letterSpacing: 2, padding: 0,
      x: 60, y: 1120, width: 1680, height: 50,
      rotation: 0, opacity: 0.85, visible: true, locked: false,
    },
  ],
  createdAt: now(), updatedAt: now(),
}

// ─────────────────────────────────────────────────────────────
// 6. Vertical Duo 2×6 (2 Foto Besar Vertikal)
// Size: 600 × 1800 px
// ─────────────────────────────────────────────────────────────
export const TEMPLATE_VERTICAL_DUO: PhotoTemplate = {
  id:          'preset-vertical-duo',
  name:        'Vertical Duo Strip',
  description: 'Strip 2 foto besar vertikal dengan ruang teks luas',
  category:    'strip',
  totalSlots:  2,
  canvas: { width: 600, height: 1800, background: '#18181b', dpi: 300 },
  elements: [
    {
      id: 'p0', type: 'photo', name: 'Foto 1',
      slot: 0, fit: 'cover', borderRadius: 8, flipH: false, flipV: false,
      x: 36, y: 48, width: 528, height: 680,
      rotation: 0, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'p1', type: 'photo', name: 'Foto 2',
      slot: 1, fit: 'cover', borderRadius: 8, flipH: false, flipV: false,
      x: 36, y: 768, width: 528, height: 680,
      rotation: 0, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'txt-title', type: 'text', name: 'Title',
      text: 'RD Photobooth',
      fontFamily: 'Inter', fontSize: 32, fontWeight: '800', fontStyle: 'normal',
      color: '#ffffff', textAlign: 'center', lineHeight: 1.2, letterSpacing: 3, padding: 0,
      x: 36, y: 1540, width: 528, height: 50,
      rotation: 0, opacity: 0.95, visible: true, locked: false,
    },
    {
      id: 'txt-date', type: 'text', name: 'Date',
      text: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      fontFamily: 'Inter', fontSize: 20, fontWeight: '400', fontStyle: 'normal',
      color: '#a1a1aa', textAlign: 'center', lineHeight: 1.2, letterSpacing: 1, padding: 0,
      x: 36, y: 1610, width: 528, height: 35,
      rotation: 0, opacity: 0.8, visible: true, locked: false,
    },
  ],
  createdAt: now(), updatedAt: now(),
}

// ─────────────────────────────────────────────────────────────
// 7. Single Elegant Frame (1 Foto Portrait 4" × 6")
// Size: 1800 × 1200 px
// ─────────────────────────────────────────────────────────────
export const TEMPLATE_SINGLE_FRAME: PhotoTemplate = {
  id:          'preset-single-frame',
  name:        'Single Elegant Frame',
  description: '1 foto besar dengan border dan aksen tipografi elegan',
  category:    'minimal',
  totalSlots:  1,
  canvas: { width: 1800, height: 1200, background: '#09090b', dpi: 300 },
  elements: [
    {
      id: 'bg-border', type: 'shape', name: 'Bingkai Luar',
      shape: 'rect', fill: 'transparent', stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, borderRadius: 12,
      x: 24, y: 24, width: 1752, height: 1152,
      rotation: 0, opacity: 1, visible: true, locked: true,
    },
    {
      id: 'p0', type: 'photo', name: 'Foto',
      slot: 0, fit: 'cover', borderRadius: 8, flipH: false, flipV: false,
      x: 56, y: 56, width: 1688, height: 960,
      rotation: 0, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'txt-event', type: 'text', name: 'Nama Event',
      text: 'RD Photobooth',
      fontFamily: 'Inter', fontSize: 36, fontWeight: '600', fontStyle: 'normal',
      color: '#f59e0b', textAlign: 'center', lineHeight: 1.2, letterSpacing: 3, padding: 0,
      x: 56, y: 1060, width: 1688, height: 45,
      rotation: 0, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'txt-date', type: 'text', name: 'Tanggal',
      text: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      fontFamily: 'Inter', fontSize: 22, fontWeight: '400', fontStyle: 'normal',
      color: '#71717a', textAlign: 'center', lineHeight: 1.2, letterSpacing: 2, padding: 0,
      x: 56, y: 1115, width: 1688, height: 35,
      rotation: 0, opacity: 0.85, visible: true, locked: false,
    },
  ],
  createdAt: now(), updatedAt: now(),
}

// ─────────────────────────────────────────────────────────────
// 8. Single Classic Polaroid (1 Foto Polaroid)
// Size: 1200 × 1500 px
// ─────────────────────────────────────────────────────────────
export const TEMPLATE_SINGLE_POLAROID: PhotoTemplate = {
  id:          'preset-single-polaroid',
  name:        'Classic Polaroid',
  description: 'Kartu polaroid klasik dengan space tulisan di bawah',
  category:    'polaroid',
  totalSlots:  1,
  canvas: { width: 1200, height: 1500, background: '#f4f3ef', dpi: 300 },
  elements: [
    {
      id: 'p0', type: 'photo', name: 'Foto',
      slot: 0, fit: 'cover', borderRadius: 4, flipH: false, flipV: false,
      x: 80, y: 80, width: 1040, height: 1040,
      rotation: 0, opacity: 1, visible: true, locked: false,
    },
    {
      id: 'txt-note', type: 'text', name: 'Tulisan Memo',
      text: 'RD Photobooth',
      fontFamily: 'Inter', fontSize: 44, fontWeight: '300', fontStyle: 'italic',
      color: '#27272a', textAlign: 'center', lineHeight: 1.3, letterSpacing: 2, padding: 0,
      x: 80, y: 1220, width: 1040, height: 60,
      rotation: 0, opacity: 0.9, visible: true, locked: false,
    },
    {
      id: 'txt-date', type: 'text', name: 'Tanggal Memo',
      text: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      fontFamily: 'Inter', fontSize: 24, fontWeight: '400', fontStyle: 'normal',
      color: '#71717a', textAlign: 'center', lineHeight: 1.2, letterSpacing: 1, padding: 0,
      x: 80, y: 1310, width: 1040, height: 40,
      rotation: 0, opacity: 0.75, visible: true, locked: false,
    },
  ],
  createdAt: now(), updatedAt: now(),
}

// ─── Registry ─────────────────────────────────────────────────
export const PRESET_TEMPLATES: PhotoTemplate[] = [
  TEMPLATE_STRIP_2X6_WHITE,
  TEMPLATE_STRIP_2X6_DARK,
  TEMPLATE_GRID_4PHOTO,
  TEMPLATE_STRIP_4PHOTO,
  TEMPLATE_POLAROID_DUO,
  TEMPLATE_VERTICAL_DUO,
  TEMPLATE_SINGLE_FRAME,
  TEMPLATE_SINGLE_POLAROID,
]

export function getPreset(id: string): PhotoTemplate | undefined {
  return PRESET_TEMPLATES.find(t => t.id === id)
}
