/**
 * Printer Service
 * Abstraksi untuk melakukan pencetakan foto fisik beresolusi tinggi (300 DPI)
 * secara borderless menggunakan Native Browser Print Engine / System Print Dialog.
 */

export interface PrintOptions {
  copies?: number
  title?: string
  autoCloseTimeout?: number
}

/**
 * Mencetak gambar (base64 dataUrl atau image URL) secara langsung ke printer fisik.
 * Membuka iframe tersembunyi dengan layout CSS @page dan @media print borderless.
 */
export function printImage(imageUrl: string, options: PrintOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(false)
      return
    }

    try {
      // 1. Buat hidden iframe khusus untuk cetak
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      iframe.style.visibility = 'hidden'
      iframe.setAttribute('aria-hidden', 'true')

      document.body.appendChild(iframe)

      const doc = iframe.contentWindow?.document
      if (!doc || !iframe.contentWindow) {
        if (document.body.contains(iframe)) document.body.removeChild(iframe)
        resolve(false)
        return
      }

      // 2. Tulis dokumen HTML cetak dengan CSS borderless
      doc.open()
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${options.title || 'RD Photobooth — Print'}</title>
          <style>
            @page {
              size: auto;
              margin: 0;
            }
            @media print {
              html, body {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
                background: #ffffff;
                overflow: hidden;
              }
              img {
                display: block;
                width: 100%;
                height: 100%;
                object-fit: contain;
                page-break-inside: avoid;
              }
            }
            body {
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #ffffff;
            }
            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          <img id="print-photo" src="${imageUrl}" alt="Print" />
        </body>
        </html>
      `)
      doc.close()

      const img = doc.getElementById('print-photo') as HTMLImageElement | null

      const triggerPrint = () => {
        try {
          iframe.contentWindow?.focus()
          iframe.contentWindow?.print()
          resolve(true)
        } catch (err) {
          console.error('[Printer] Print execution failed:', err)
          resolve(false)
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe)
            }
          }, options.autoCloseTimeout ?? 2500)
        }
      }

      if (img) {
        if (img.complete) {
          setTimeout(triggerPrint, 150)
        } else {
          img.onload = () => setTimeout(triggerPrint, 150)
          img.onerror = () => {
            if (document.body.contains(iframe)) document.body.removeChild(iframe)
            resolve(false)
          }
        }
      } else {
        triggerPrint()
      }
    } catch (err) {
      console.error('[Printer] Error initializing print iframe:', err)
      resolve(false)
    }
  })
}

/**
 * Menghasilkan gambar pola uji cetak (test print pattern) 600x1800 px @ 300 DPI
 * untuk menguji kalibrasi warna, alignment garis, dan fungsionalitas printer fisik.
 */
export function generateTestPrintPattern(): string {
  if (typeof document === 'undefined') return ''

  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 1800
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // 1. Background putih bersih
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 600, 1800)

  // 2. Border batas cetak luar (16px)
  ctx.strokeStyle = '#18181b'
  ctx.lineWidth = 4
  ctx.strokeRect(16, 16, 568, 1768)

  // 3. Header Test Print
  ctx.fillStyle = '#18181b'
  ctx.font = 'bold 28px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('RD PHOTOBOOTH', 300, 80)

  ctx.font = '600 16px Inter, sans-serif'
  ctx.fillStyle = '#f59e0b'
  ctx.fillText('HARDWARE TEST PRINT PATTERN', 300, 115)

  ctx.font = '400 12px monospace'
  ctx.fillStyle = '#71717a'
  ctx.fillText(`Date: ${new Date().toLocaleString('id-ID')} | 300 DPI`, 300, 140)

  // 4. Color Swatches (CMYK & Primary Colors)
  const colors = [
    { name: 'Black', hex: '#000000' },
    { name: 'Cyan', hex: '#00ffff' },
    { name: 'Magenta', hex: '#ff00ff' },
    { name: 'Yellow', hex: '#ffff00' },
    { name: 'Red', hex: '#ef4444' },
    { name: 'Green', hex: '#22c55e' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Amber', hex: '#f59e0b' },
  ]

  const swatchW = 250
  const swatchH = 65
  colors.forEach((c, idx) => {
    const col = idx % 2
    const row = Math.floor(idx / 2)
    const x = 36 + col * (swatchW + 28)
    const y = 180 + row * (swatchH + 18)

    ctx.fillStyle = c.hex
    ctx.fillRect(x, y, swatchW, swatchH)
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'
    ctx.lineWidth = 1
    ctx.strokeRect(x, y, swatchW, swatchH)

    ctx.fillStyle = c.hex === '#ffffff' || c.hex === '#ffff00' || c.hex === '#00ffff' ? '#18181b' : '#ffffff'
    ctx.font = 'bold 12px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(c.name, x + swatchW / 2, y + swatchH / 2 + 4)
  })

  // 5. Grayscale Ramp
  const grayY = 560
  const stepW = 528 / 10
  for (let i = 0; i < 10; i++) {
    const val = Math.round((i / 9) * 255)
    ctx.fillStyle = `rgb(${val},${val},${val})`
    ctx.fillRect(36 + i * stepW, grayY, stepW, 45)
  }
  ctx.strokeStyle = '#d4d4d8'
  ctx.strokeRect(36, grayY, 528, 45)

  // 6. Photo Resolution & Detail Test Box
  ctx.fillStyle = '#f4f4f5'
  ctx.fillRect(36, 640, 528, 700)
  ctx.strokeStyle = '#e4e4e7'
  ctx.strokeRect(36, 640, 528, 700)

  // Crosshairs in test box
  ctx.strokeStyle = '#a1a1aa'
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(36, 640 + 350)
  ctx.lineTo(564, 640 + 350)
  ctx.moveTo(300, 640)
  ctx.lineTo(300, 640 + 700)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = '#27272a'
  ctx.font = 'bold 18px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('ALIGNMENT & FOCUS GRID', 300, 970)
  ctx.font = '400 13px Inter, sans-serif'
  ctx.fillStyle = '#71717a'
  ctx.fillText('Resolusi: 600 × 1800 px (2" × 6" Strip)', 300, 1000)

  // 7. Micro Text Sharpness Test
  ctx.textAlign = 'center'
  ctx.fillStyle = '#18181b'
  ctx.font = '10px Inter, sans-serif'
  ctx.fillText('10px Sharpness Text Check: The quick brown fox jumps over the lazy dog', 300, 1400)
  ctx.font = '8px Inter, sans-serif'
  ctx.fillText('8px Sharpness Text Check: 1234567890 ABCDEFGHIJKLMNOPQRSTUVWXYZ', 300, 1430)

  // 8. Footer Pass Stamp
  ctx.fillStyle = '#18181b'
  ctx.font = 'bold 14px Inter, sans-serif'
  ctx.fillText('STATUS: PRINTER ENGINE READY', 300, 1680)

  ctx.font = '600 11px Inter, sans-serif'
  ctx.fillStyle = '#a1a1aa'
  ctx.fillText('RD PHOTOBOOTH HARDWARE SUBSYSTEM', 300, 1720)

  return canvas.toDataURL('image/png')
}
