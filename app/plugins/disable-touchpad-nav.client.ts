export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return

  // 1. Prevent Trackpad/Touchpad horizontal 2-finger swipe navigation
  window.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      // If the scroll is predominantly horizontal (Mac touchpad 2-finger swipe back/forward)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 5) {
        e.preventDefault()
      }
    },
    { passive: false }
  )

  // 2. Prevent Touch/Gesture horizontal swipe back on touchpads & tablets
  let startX = 0
  let startY = 0

  window.addEventListener(
    'touchstart',
    (e: TouchEvent) => {
      if (e.touches.length > 0) {
        startX = e.touches[0].clientX
        startY = e.touches[0].clientY
      }
    },
    { passive: true }
  )

  window.addEventListener(
    'touchmove',
    (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const deltaX = Math.abs(e.touches[0].clientX - startX)
        const deltaY = Math.abs(e.touches[0].clientY - startY)

        // If swipe starts from the edge (browser back gesture)
        if (startX < 30 || startX > window.innerWidth - 30) {
          if (deltaX > deltaY) {
            e.preventDefault()
          }
        }
      }
    },
    { passive: false }
  )
})
