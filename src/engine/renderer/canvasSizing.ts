import type { CanvasPhysicalSize } from '@/types/geometry'

const MAX_DPR = 2

export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') return 1
  return Math.min(window.devicePixelRatio || 1, MAX_DPR)
}

/**
 * Sizes the backing store to CSS pixels × DPR and configures the 2D context
 * so draw calls can consistently use CSS pixel coordinates.
 */
export function resizeCanvasToDisplaySize(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  cssWidth: number,
  cssHeight: number,
): CanvasPhysicalSize {
  const dpr = getDevicePixelRatio()
  const pixelWidth = Math.max(1, Math.floor(cssWidth * dpr))
  const pixelHeight = Math.max(1, Math.floor(cssHeight * dpr))

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth
    canvas.height = pixelHeight
  }

  canvas.style.width = `${cssWidth}px`
  canvas.style.height = `${cssHeight}px`

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  return {
    cssWidth,
    cssHeight,
    pixelWidth,
    pixelHeight,
    dpr,
  }
}
