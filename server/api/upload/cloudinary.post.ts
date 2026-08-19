interface CloudinaryUploadPayload {
  dataUrl: string
  sessionId: string
  eventName?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CloudinaryUploadPayload>(event)
  if (!body || !body.dataUrl || !body.sessionId) {
    throw createError({ statusCode: 400, message: 'dataUrl and sessionId are required' })
  }

  const settings = readJSON<Record<string, unknown>>('settings.json', {})
  const cloudName = ((settings.cloudinaryCloudName as string) || process.env.CLOUDINARY_CLOUD_NAME || '').trim()
  const uploadPreset = ((settings.cloudinaryPreset as string) || process.env.CLOUDINARY_UPLOAD_PRESET || '').trim()
  const baseFolder = ((settings.cloudinaryFolder as string) || process.env.CLOUDINARY_FOLDER || 'photobooth').trim()

  if (!cloudName || !uploadPreset) {
    return {
      success: false,
      notConfigured: true,
      message: 'Cloudinary belum dikonfigurasi. Menggunakan tautan lokal.',
    }
  }

  const cleanEvent = (body.eventName || 'rd-photobooth').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
  const cleanSessionId = body.sessionId.replace(/[^a-zA-Z0-9_-]/g, '')
  const targetFolder = `${baseFolder}/${cleanEvent}/${cleanSessionId}`

  try {
    const formData = new FormData()
    formData.append('file', body.dataUrl)
    formData.append('upload_preset', uploadPreset)
    formData.append('folder', targetFolder)
    formData.append('public_id', 'photostrip')

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    if (!response.ok || !data.secure_url) {
      console.error('[Cloudinary] Upload failed:', data)
      return {
        success: false,
        error: data.error?.message || 'Gagal mengunggah ke Cloudinary',
      }
    }

    const secureUrl = data.secure_url as string

    // Update sessions.json with cloudUrl
    const sessions = readJSON<Array<{ id: string; cloudUrl?: string; [key: string]: unknown }>>('sessions.json', [])
    const idx = sessions.findIndex(s => s.id === body.sessionId)
    if (idx !== -1) {
      sessions[idx].cloudUrl = secureUrl
      writeJSON('sessions.json', sessions)
    }

    return {
      success: true,
      url: secureUrl,
      publicId: data.public_id,
    }
  } catch (err: any) {
    console.error('[Cloudinary] Network error:', err)
    return {
      success: false,
      error: err.message || 'Gagal terhubung ke Cloudinary',
    }
  }
})
