/**
 * Canvas Renderer
 * Merender PhotoTemplate ke HTMLCanvasElement menggunakan Canvas 2D API.
 * Semua rendering murni client-side — tidak butuh server.
 */
import type {
  PhotoTemplate,
  TemplateElement,
  PhotoElement,
  TextElement,
  ImageElement,
  ShapeElement,
  ShadowStyle,
} from '~/types/template'

export interface RenderOptions {
  /** Map dari slot index → dataUrl foto yang sudah di-capture */
  photos: Record<number, string>
  /** Scale factor (1 = full resolution, 0.5 = half) */
  scale?: number
  /** Override background */
  background?: string
  /** Nama Event / Acara dinamis */
  eventName?: string
  /** Tanggal event dinamis */
  eventDate?: string
}

export interface RenderResult {
  canvas:    HTMLCanvasElement
  dataUrl:   string
  width:     number
  height:    number
}

// Image cache to avoid reloading assets
const imageCache = new Map<string, HTMLImageElement>()

function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) return Promise.resolve(imageCache.get(src)!)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => { imageCache.set(src, img); resolve(img) }
    img.onerror = reject
    img.src     = src
  })
}

// ─── Main render function ─────────────────────────────────────
export async function renderTemplate(
  template: PhotoTemplate,
  options:  RenderOptions,
): Promise<RenderResult> {
  const scale  = options.scale ?? 1
  const W      = Math.round(template.canvas.width  * scale)
  const H      = Math.round(template.canvas.height * scale)

  const canvas  = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H

  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)

  // ── Background ────────────────────────────────────────────
  const bg = options.background ?? template.canvas.background
  if (bg === 'transparent') {
    ctx.clearRect(0, 0, template.canvas.width, template.canvas.height)
  } else {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, template.canvas.width, template.canvas.height)
  }

  // ── Render elements in order ──────────────────────────────
  for (const el of template.elements) {
    if (!el.visible) continue
    await renderElement(ctx, el, options.photos, options)
  }

  return {
    canvas,
    dataUrl: canvas.toDataURL('image/jpeg', 0.95),
    width:   W,
    height:  H,
  }
}

// ─── Element dispatcher ───────────────────────────────────────
async function renderElement(
  ctx:     CanvasRenderingContext2D,
  el:      TemplateElement,
  photos:  Record<number, string>,
  options: RenderOptions,
) {
  ctx.save()

  // Transform: translate to center, rotate, translate back
  const cx = el.x + el.width  / 2
  const cy = el.y + el.height / 2
  ctx.translate(cx, cy)
  if (el.rotation) ctx.rotate((el.rotation * Math.PI) / 180)
  ctx.translate(-cx, -cy)

  ctx.globalAlpha = el.opacity

  switch (el.type) {
    case 'photo':  await renderPhoto(ctx, el, photos); break
    case 'text':         renderText(ctx, el, options.eventName, options.eventDate); break
    case 'image':  await renderImage(ctx, el);         break
    case 'shape':        renderShape(ctx, el);         break
  }

  ctx.restore()
}

// ─── Photo ────────────────────────────────────────────────────
async function renderPhoto(
  ctx:    CanvasRenderingContext2D,
  el:     PhotoElement,
  photos: Record<number, string>,
) {
  const src = photos[el.slot]
  if (!src) {
    // Placeholder
    ctx.fillStyle = '#1a1a1a'
    roundRect(ctx, el.x, el.y, el.width, el.height, el.borderRadius)
    ctx.fill()
    ctx.fillStyle = '#333'
    ctx.font = `bold ${Math.min(el.width, el.height) * 0.15}px Inter, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`Foto ${el.slot + 1}`, el.x + el.width / 2, el.y + el.height / 2)
    return
  }

  const img = await loadImage(src).catch(() => null)
  if (!img) return

  // Shadow
  if (el.shadow) applyShadow(ctx, el.shadow)

  // Clip to rounded rect
  ctx.save()
  roundRect(ctx, el.x, el.y, el.width, el.height, el.borderRadius)
  ctx.clip()

  // Flip transforms
  if (el.flipH || el.flipV) {
    ctx.translate(
      el.flipH ? el.x + el.width  : 0,
      el.flipV ? el.y + el.height : 0,
    )
    ctx.scale(el.flipH ? -1 : 1, el.flipV ? -1 : 1)
  }

  // Draw with fit mode
  const { sx, sy, sw, sh, dx, dy, dw, dh } = computeFit(img, el)
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)

  ctx.restore()

  // Border
  if (el.border) {
    ctx.strokeStyle  = el.border.color
    ctx.lineWidth    = el.border.width
    ctx.setLineDash(el.border.style === 'dashed' ? [8, 4] : el.border.style === 'dotted' ? [2, 4] : [])
    roundRect(ctx, el.x, el.y, el.width, el.height, el.borderRadius)
    ctx.stroke()
    ctx.setLineDash([])
  }
}

// ─── Text ─────────────────────────────────────────────────────
function renderText(
  ctx: CanvasRenderingContext2D,
  el: TextElement,
  eventName?: string,
  eventDate?: string,
) {
  if (el.shadow) applyShadow(ctx, el.shadow)
  if (el.background) {
    ctx.fillStyle = el.background
    roundRect(ctx, el.x, el.y, el.width, el.height, 4)
    ctx.fill()
  }

  ctx.clearShadow?.()
  ctx.shadowColor   = 'transparent'
  ctx.shadowBlur    = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  ctx.fillStyle    = el.color
  ctx.textAlign    = el.textAlign as CanvasTextAlign
  ctx.textBaseline = 'middle'
  ctx.font         = `${el.fontStyle} ${el.fontWeight} ${el.fontSize}px "${el.fontFamily}", sans-serif`

  // Resolve dynamic event title and photobooth branding
  let displayText = el.text

  const hasCustomEvent = Boolean(
    eventName &&
    eventName.trim() &&
    eventName.trim().toLowerCase() !== 'rd photobooth'
  )

  const isDateElement = Boolean(
    el.id === 'txt-date' ||
    el.name?.toLowerCase().includes('date') ||
    el.name?.toLowerCase().includes('tanggal')
  )

  if (hasCustomEvent) {
    if (displayText.includes('{{eventName}}')) {
      displayText = displayText.replace(/\{\{eventName\}\}/g, eventName!.trim())
    } else if (isDateElement) {
      const datePart = eventDate?.trim() || el.text
      displayText = `RD Photobooth · ${datePart}`
    } else {
      displayText = eventName!.trim()
    }
  } else {
    if (eventDate && eventDate.trim()) {
      if (displayText.includes('{{eventDate}}') || isDateElement) {
        displayText = eventDate.trim()
      }
    }
  }

  if (el.letterSpacing !== 0) {
    // Manual letter spacing
    const chars   = [...displayText]
    let advance   = el.textAlign === 'center'
      ? el.x + el.width / 2 - measureTextWidth(ctx, displayText, el.letterSpacing) / 2
      : el.textAlign === 'right'
        ? el.x + el.width - el.padding - measureTextWidth(ctx, displayText, el.letterSpacing)
        : el.x + el.padding
    const y       = el.y + el.height / 2
    ctx.textAlign = 'left'
    for (const ch of chars) {
      ctx.fillText(ch, advance, y)
      advance += ctx.measureText(ch).width + el.letterSpacing
    }
  } else {
    const x = el.textAlign === 'center'
      ? el.x + el.width / 2
      : el.textAlign === 'right'
        ? el.x + el.width - el.padding
        : el.x + el.padding
    ctx.fillText(displayText, x, el.y + el.height / 2)
  }
}

function measureTextWidth(ctx: CanvasRenderingContext2D, text: string, spacing: number): number {
  return [...text].reduce((acc, ch) => acc + ctx.measureText(ch).width + spacing, 0)
}

// ─── Image/Overlay ────────────────────────────────────────────
async function renderImage(ctx: CanvasRenderingContext2D, el: ImageElement) {
  if (!el.src) return
  const img = await loadImage(el.src).catch(() => null)
  if (!img) return

  const prevBlend        = ctx.globalCompositeOperation
  ctx.globalCompositeOperation = el.blendMode as GlobalCompositeOperation

  ctx.save()
  roundRect(ctx, el.x, el.y, el.width, el.height, el.borderRadius)
  ctx.clip()
  const { sx, sy, sw, sh, dx, dy, dw, dh } = computeFit(img, el)
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
  ctx.restore()

  ctx.globalCompositeOperation = prevBlend
}

// ─── Shape ────────────────────────────────────────────────────
function renderShape(ctx: CanvasRenderingContext2D, el: ShapeElement) {
  ctx.fillStyle   = el.fill
  ctx.strokeStyle = el.stroke
  ctx.lineWidth   = el.strokeWidth

  if (el.shape === 'ellipse') {
    ctx.beginPath()
    ctx.ellipse(
      el.x + el.width / 2, el.y + el.height / 2,
      el.width / 2, el.height / 2,
      0, 0, Math.PI * 2,
    )
    if (el.fill)   ctx.fill()
    if (el.stroke && el.strokeWidth) ctx.stroke()
  } else if (el.shape === 'line') {
    ctx.beginPath()
    ctx.moveTo(el.x, el.y + el.height / 2)
    ctx.lineTo(el.x + el.width, el.y + el.height / 2)
    ctx.stroke()
  } else {
    roundRect(ctx, el.x, el.y, el.width, el.height, el.borderRadius)
    if (el.fill)   ctx.fill()
    if (el.stroke && el.strokeWidth) ctx.stroke()
  }
}

// ─── Helpers ──────────────────────────────────────────────────
function applyShadow(ctx: CanvasRenderingContext2D, s: ShadowStyle) {
  ctx.shadowOffsetX = s.offsetX
  ctx.shadowOffsetY = s.offsetY
  ctx.shadowBlur    = s.blur
  ctx.shadowColor   = s.color
}

function roundRect(
  ctx:    CanvasRenderingContext2D,
  x:      number, y: number,
  w:      number, h: number,
  radius: number,
) {
  const r = Math.min(radius, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y,     x + w, y + r,     r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x,     y + h, x,     y + h - r, r)
  ctx.lineTo(x,     y + r)
  ctx.arcTo(x,     y,     x + r, y,         r)
  ctx.closePath()
}

interface DrawParams { sx: number; sy: number; sw: number; sh: number; dx: number; dy: number; dw: number; dh: number }

function computeFit(
  img: HTMLImageElement,
  el: { x: number; y: number; width: number; height: number; fit: string },
): DrawParams {
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  const ew = el.width
  const eh = el.height

  if (el.fit === 'fill') {
    return { sx: 0, sy: 0, sw: iw, sh: ih, dx: el.x, dy: el.y, dw: ew, dh: eh }
  }

  if (el.fit === 'none') {
    return { sx: 0, sy: 0, sw: Math.min(iw, ew), sh: Math.min(ih, eh), dx: el.x, dy: el.y, dw: Math.min(iw, ew), dh: Math.min(ih, eh) }
  }

  const imgRatio  = iw / ih
  const elemRatio = ew / eh

  if (el.fit === 'cover') {
    // Crop to fill the element area
    if (imgRatio > elemRatio) {
      const sh = ih
      const sw = ih * elemRatio
      const sx = (iw - sw) / 2
      return { sx, sy: 0, sw, sh, dx: el.x, dy: el.y, dw: ew, dh: eh }
    } else {
      const sw = iw
      const sh = iw / elemRatio
      const sy = (ih - sh) / 2
      return { sx: 0, sy, sw, sh, dx: el.x, dy: el.y, dw: ew, dh: eh }
    }
  }

  // contain
  if (imgRatio > elemRatio) {
    const dw = ew
    const dh = ew / imgRatio
    const dy = el.y + (eh - dh) / 2
    return { sx: 0, sy: 0, sw: iw, sh: ih, dx: el.x, dy, dw, dh }
  } else {
    const dh = eh
    const dw = eh * imgRatio
    const dx = el.x + (ew - dw) / 2
    return { sx: 0, sy: 0, sw: iw, sh: ih, dx, dy: el.y, dw, dh }
  }
}
