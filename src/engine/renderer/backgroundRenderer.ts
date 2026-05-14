import type { FrameRenderContext } from '@/types/canvas'
import { CC_PALETTE } from '@/lib/palette'

/**
 * Atmospheric stage backdrop. Intentionally gameplay-agnostic.
 */
export function renderBackground(context: FrameRenderContext): void {
  const { ctx, cssWidth, cssHeight, now } = context

  const gradient = ctx.createLinearGradient(0, 0, cssWidth, cssHeight)
  gradient.addColorStop(0, CC_PALETTE.forest)
  gradient.addColorStop(0.55, CC_PALETTE.midnight)
  gradient.addColorStop(1, '#071f16')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, cssWidth, cssHeight)

  const pulse = (Math.sin(now * 0.0008) + 1) * 0.5
  const vignette = ctx.createRadialGradient(
    cssWidth * 0.5,
    cssHeight * 0.35,
    Math.min(cssWidth, cssHeight) * 0.1,
    cssWidth * 0.5,
    cssHeight * 0.5,
    Math.max(cssWidth, cssHeight) * 0.75,
  )
  vignette.addColorStop(0, `rgba(131, 153, 88, ${0.08 + pulse * 0.04})`)
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.55)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, cssWidth, cssHeight)

  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = 'rgba(247, 244, 213, 0.035)'
  const step = 48
  for (let x = 0; x < cssWidth; x += step) {
    for (let y = 0; y < cssHeight; y += step) {
      const ox = (x + y * 0.12 + now * 0.012) % step
      ctx.beginPath()
      ctx.arc(x + ox, y, 1.05, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()

  const boardGlow = ctx.createRadialGradient(
    cssWidth * 0.5,
    cssHeight * 0.5,
    Math.min(cssWidth, cssHeight) * 0.15,
    cssWidth * 0.5,
    cssHeight * 0.5,
    Math.max(cssWidth, cssHeight) * 0.55,
  )
  boardGlow.addColorStop(0, 'rgba(16, 86, 102, 0.18)')
  boardGlow.addColorStop(1, 'rgba(10, 51, 35, 0)')
  ctx.fillStyle = boardGlow
  ctx.fillRect(0, 0, cssWidth, cssHeight)
}
