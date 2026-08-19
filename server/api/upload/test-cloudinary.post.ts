interface TestCloudinaryPayload {
  cloudName: string
  uploadPreset: string
  folder?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<TestCloudinaryPayload>(event)
  if (!body || !body.cloudName || !body.uploadPreset) {
    throw createError({ statusCode: 400, message: 'Cloud Name dan Upload Preset wajib diisi' })
  }

  const cloudName = body.cloudName.trim()
  const uploadPreset = body.uploadPreset.trim()
  const folder = (body.folder || 'photobooth-test').trim()

  // 1x1 transparent PNG data url for fast testing
  const dummyPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

  try {
    const formData = new FormData()
    formData.append('file', dummyPixel)
    formData.append('upload_preset', uploadPreset)
    formData.append('folder', folder)
    formData.append('public_id', `test-${Date.now()}`)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    if (!response.ok || !data.secure_url) {
      throw createError({
        statusCode: 400,
        message: data.error?.message || 'Koneksi Cloudinary gagal. Periksa Cloud Name dan Upload Preset.',
      })
    }

    return {
      success: true,
      url: data.secure_url,
      message: 'Koneksi Cloudinary berhasil! Siap digunakan.',
    }
  } catch (err: any) {
    console.error('[Cloudinary] Test failed:', err)
    throw createError({
      statusCode: 500,
      message: err.message || 'Gagal menghubungi server Cloudinary.',
    })
  }
})
