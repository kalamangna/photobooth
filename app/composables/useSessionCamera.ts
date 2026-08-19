import { settingsDB } from '~/services/db'

export function useSessionCamera() {
  const videoRef = ref<HTMLVideoElement | null>(null)
  let stream: MediaStream | null = null

  async function initCamera() {
    await nextTick()
    if (stream && stream.active && videoRef.value) {
      videoRef.value.srcObject = stream
      videoRef.value.play().catch(() => {})
      return
    }
    try {
      const savedCameraId =
        (await settingsDB.get<string>('selectedCameraId')) ||
        (typeof localStorage !== 'undefined'
          ? localStorage.getItem('photobooth_camera_id')
          : '') ||
        ''

      let mediaStream: MediaStream | null = null

      if (savedCameraId) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: savedCameraId },
              width: { ideal: 1920, min: 640 },
              height: { ideal: 1080, min: 480 },
            },
            audio: false,
          })
        } catch {
          // Fallback jika deviceId tidak ditemukan
        }
      }

      if (!mediaStream) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1920, min: 640 },
              height: { ideal: 1080, min: 480 },
              facingMode: 'user',
            },
            audio: false,
          })
        } catch {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          })
        }
      }

      stream = mediaStream
      if (videoRef.value && stream) {
        videoRef.value.srcObject = stream
        videoRef.value.onloadedmetadata = () => {
          videoRef.value?.play().catch(() => {})
        }
        await videoRef.value.play().catch(() => {})
      }
    } catch (err) {
      console.warn('[Camera] Mock:', err)
      initMockStream()
    }
  }

  function initMockStream() {
    const canvas = document.createElement('canvas')
    canvas.width = 1280
    canvas.height = 960
    const ctx = canvas.getContext('2d')!
    function draw() {
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 36px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('📷 RD Photobooth', canvas.width / 2, canvas.height / 2 - 16)
      ctx.fillStyle = '#52525b'
      ctx.font = '20px Inter, sans-serif'
      ctx.fillText('Simulasi Kamera', canvas.width / 2, canvas.height / 2 + 24)
      requestAnimationFrame(draw)
    }
    draw()
    const mockStream = (canvas as any).captureStream?.(30)
    if (mockStream && videoRef.value) {
      videoRef.value.srcObject = mockStream
      videoRef.value.play().catch(() => {})
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      stream = null
    }
  }

  function grabFrame(): string {
    const video = videoRef.value
    if (!video) return ''
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 960
    const ctx = canvas.getContext('2d')!
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.93)
  }

  return { videoRef, initCamera, stopCamera, grabFrame }
}
