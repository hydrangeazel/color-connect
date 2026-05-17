import type { BoardLayout } from '@/engine/grid/boardLayout'
import { cellToCanvasRect } from '@/engine/grid/cellMapping'
import type { FrameRenderContext } from '@/types/canvas'
import type { GridCell } from '@/types/grid'

export type BoardRenderOptions = {
  layout: BoardLayout
  hoverCell: GridCell | null
  now: number
  solved?: boolean
  solvedAtMs?: number | null
}

export function renderBoard(
  context: FrameRenderContext,
  { layout, hoverCell, now, solved, solvedAtMs }: BoardRenderOptions,
): void {
  const { ctx } = context

  ctx.save()
  ctx.translate(layout.originX, layout.originY)

  const r = Math.min(20, layout.cellSize * 0.4)

  // Ambient rim — draws the eye to the playfield
  ctx.shadowColor = 'rgba(131, 153, 88, 0.45)'
  ctx.shadowBlur = layout.cellSize * 0.85
  ctx.fillStyle = 'rgba(10, 51, 35, 0.82)'
  ctx.strokeStyle = 'rgba(247, 244, 213, 0.22)'
  ctx.lineWidth = 1.5
  roundRect(ctx, 0, 0, layout.boardSizePx, layout.boardSizePx, r)
  ctx.fill()
  ctx.stroke()
  ctx.shadowBlur = 0

  // Inner working surface
  ctx.fillStyle = 'rgba(7, 31, 22, 0.55)'
  ctx.strokeStyle = 'rgba(16, 86, 102, 0.35)'
  ctx.lineWidth = 1
  roundRect(ctx, 2, 2, layout.boardSizePx - 4, layout.boardSizePx - 4, Math.max(4, r - 4))
  ctx.fill()
  ctx.stroke()

  if (hoverCell) {
    const rect = cellToCanvasRect(layout, hoverCell)
    const localX = rect.x - layout.originX
    const localY = rect.y - layout.originY
    const breath = 0.62 + Math.sin(now * 0.007) * 0.1

    ctx.fillStyle = `rgba(131, 153, 88, ${0.2 * breath})`
    ctx.strokeStyle = `rgba(247, 244, 213, ${0.28 * breath})`
    ctx.lineWidth = 1.5
    roundRect(ctx, localX + 1, localY + 1, rect.w - 2, rect.h - 2, Math.min(12, rect.w * 0.22))
    ctx.fill()
    ctx.stroke()
  }

  ctx.strokeStyle = 'rgba(247, 244, 213, 0.14)'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let i = 0; i <= layout.gridSize; i += 1) {
    const p = i * layout.cellSize
    ctx.moveTo(p, 0)
    ctx.lineTo(p, layout.boardSizePx)
    ctx.moveTo(0, p)
    ctx.lineTo(layout.boardSizePx, p)
  }
  ctx.stroke()

  if (solved) {
    const pulse = solvedAtMs != null ? 0.45 + Math.sin((now - solvedAtMs) * 0.003) * 0.22 : 0.58
    ctx.shadowColor = `rgba(211, 150, 140, ${0.35 + pulse * 0.25})`
    ctx.shadowBlur = layout.cellSize * 0.5
    ctx.strokeStyle = `rgba(247, 244, 213, ${0.45 + pulse * 0.2})`
    ctx.lineWidth = 2.8
    roundRect(ctx, -3, -3, layout.boardSizePx + 6, layout.boardSizePx + 6, r + 3)
    ctx.stroke()
    ctx.shadowBlur = 0
  }

  ctx.restore()
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
) {
  const rad = Math.min(radius, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rad, y)
  ctx.arcTo(x + w, y, x + w, y + h, rad)
  ctx.arcTo(x + w, y + h, x, y + h, rad)
  ctx.arcTo(x, y + h, x, y, rad)
  ctx.arcTo(x, y, x + w, y, rad)
  ctx.closePath()
}
