/**
 * Template Engine Types
 * Definisi model JSON untuk template photobooth.
 */

// ─── Element types ────────────────────────────────────────────

export type ElementType = 'photo' | 'text' | 'image' | 'shape'

export type BlendMode =
  | 'normal' | 'multiply' | 'screen' | 'overlay'
  | 'darken' | 'lighten' | 'color-dodge' | 'color-burn'

export type FontWeight = 'normal' | 'bold' | '300' | '400' | '500' | '600' | '700' | '800'
export type TextAlign  = 'left' | 'center' | 'right'
export type ShapeType  = 'rect' | 'ellipse' | 'line'
export type FitMode    = 'cover' | 'contain' | 'fill' | 'none'

// ─── Base element ─────────────────────────────────────────────
export interface BaseElement {
  id:       string
  type:     ElementType
  x:        number
  y:        number
  width:    number
  height:   number
  rotation: number  // degrees
  opacity:  number  // 0–1
  visible:  boolean
  locked:   boolean
  name:     string
}

// ─── Photo element ────────────────────────────────────────────
export interface PhotoElement extends BaseElement {
  type:       'photo'
  slot:       number      // 0-indexed: which captured photo
  fit:        FitMode
  borderRadius: number   // px
  border?:    BorderStyle
  shadow?:    ShadowStyle
  flipH:      boolean
  flipV:      boolean
}

// ─── Text element ─────────────────────────────────────────────
export interface TextElement extends BaseElement {
  type:        'text'
  text:        string
  fontFamily:  string
  fontSize:    number
  fontWeight:  FontWeight
  fontStyle:   'normal' | 'italic'
  color:       string   // CSS color
  textAlign:   TextAlign
  lineHeight:  number
  letterSpacing: number
  shadow?:     ShadowStyle
  background?: string
  padding:     number
}

// ─── Image/overlay element ────────────────────────────────────
export interface ImageElement extends BaseElement {
  type:      'image'
  src:       string      // URL or base64 or asset key
  asset?:    string      // asset registry key
  fit:       FitMode
  blendMode: BlendMode
  borderRadius: number
}

// ─── Shape element ────────────────────────────────────────────
export interface ShapeElement extends BaseElement {
  type:        'shape'
  shape:       ShapeType
  fill:        string
  stroke:      string
  strokeWidth: number
  borderRadius: number
}

export type TemplateElement = PhotoElement | TextElement | ImageElement | ShapeElement

// ─── Canvas ───────────────────────────────────────────────────
export interface TemplateCanvas {
  width:       number
  height:      number
  background:  string   // CSS color or 'transparent'
  dpi:         number   // 300 for print, 96 for screen
}

// ─── Full template ────────────────────────────────────────────
export interface PhotoTemplate {
  id:          string
  name:        string
  description: string
  category:    string
  totalSlots:  number
  canvas:      TemplateCanvas
  elements:    TemplateElement[]
  createdAt:   string
  updatedAt:   string
  thumbnail?:  string  // base64 preview
}

// ─── Shared style helpers ─────────────────────────────────────
export interface BorderStyle {
  width: number
  color: string
  style: 'solid' | 'dashed' | 'dotted'
}

export interface ShadowStyle {
  offsetX: number
  offsetY: number
  blur:    number
  color:   string
}

// ─── Factory helpers ──────────────────────────────────────────
function genId() {
  return Math.random().toString(36).slice(2, 10)
}

export function makePhotoElement(overrides: Partial<PhotoElement> = {}): PhotoElement {
  return {
    id: genId(), type: 'photo', name: 'Photo',
    x: 0, y: 0, width: 400, height: 300,
    rotation: 0, opacity: 1, visible: true, locked: false,
    slot: 0, fit: 'cover', borderRadius: 0,
    flipH: false, flipV: false,
    ...overrides,
  }
}

export function makeTextElement(overrides: Partial<TextElement> = {}): TextElement {
  return {
    id: genId(), type: 'text', name: 'Text',
    x: 0, y: 0, width: 300, height: 60,
    rotation: 0, opacity: 1, visible: true, locked: false,
    text: 'Teks baru', fontFamily: 'Inter', fontSize: 32,
    fontWeight: '600', fontStyle: 'normal',
    color: '#ffffff', textAlign: 'center',
    lineHeight: 1.4, letterSpacing: 0, padding: 8,
    ...overrides,
  }
}

export function makeImageElement(overrides: Partial<ImageElement> = {}): ImageElement {
  return {
    id: genId(), type: 'image', name: 'Image',
    x: 0, y: 0, width: 200, height: 100,
    rotation: 0, opacity: 1, visible: true, locked: false,
    src: '', fit: 'contain', blendMode: 'normal', borderRadius: 0,
    ...overrides,
  }
}

export function makeShapeElement(overrides: Partial<ShapeElement> = {}): ShapeElement {
  return {
    id: genId(), type: 'shape', name: 'Shape',
    x: 0, y: 0, width: 200, height: 4,
    rotation: 0, opacity: 1, visible: true, locked: false,
    shape: 'rect', fill: '#ffffff', stroke: 'transparent', strokeWidth: 0, borderRadius: 0,
    ...overrides,
  }
}
