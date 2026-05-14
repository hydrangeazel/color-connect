import type { FrameRenderContext } from '@/types/canvas'

const palette = {
  forest: '#0a3323',
  midnight: '#105666',
  moss: '#839958',
  beige: '#f7f4d5',
  rose: '#d3968c',
} as const

/**
 * Non-interactive visual baseline for the canvas stack.
 * Intentionally avoids gameplay constructs (pairs, paths, collisions).
 */
export function paintStageFoundation(context: FrameRenderContext): void {
  const { ctx, cssWidth, cssHeight, now } = context

  const gradient = ctx.createLinearGradient(0, 0, cssWidth, cssHeight)
  gradient.addColorStop(0, palette.forest)
  gradient.addColorStop(0.55, palette.midnight)
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
  ctx.fillStyle = 'rgba(247, 244, 213, 0.04)'
  const step = 48
  for (let x = 0; x < cssWidth; x += step) {
    for (let y = 0; y < cssHeight; y += step) {
      const ox = (x + y * 0.12 + now * 0.01) % step
      ctx.beginPath()
      ctx.arc(x + ox, y, 1.1, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = 'rgba(247, 244, 213, 0.08)'
  ctx.lineWidth = 1
  ctx.setLineDash([6, 10])
  ctx.strokeRect(18, 18, cssWidth - 36, cssHeight - 36)
  ctx.restore()
}
