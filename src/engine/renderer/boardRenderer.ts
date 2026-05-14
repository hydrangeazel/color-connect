import type { BoardLayout } from '@/engine/grid/boardLayout'
import { cellToCanvasRect } from '@/engine/grid/cellMapping'
import type { FrameRenderContext } from '@/types/canvas'
import type { GridCell } from '@/types/grid'

export type BoardRenderOptions = {
  layout: BoardLayout
  hoverCell: GridCell | null
  now: number
}

export function renderBoard(
  context: FrameRenderContext,
  { layout, hoverCell, now }: BoardRenderOptions,
): void {
  const { ctx } = context

  ctx.save()
  ctx.translate(layout.originX, layout.originY)

  // Soft panel behind grid
  ctx.fillStyle = 'rgba(10, 51, 35, 0.35)'
  ctx.strokeStyle = 'rgba(247, 244, 213, 0.08)'
  ctx.lineWidth = 1
  const r = Math.min(18, layout.cellSize * 0.35)
  roundRect(ctx, 0, 0, layout.boardSizePx, layout.boardSizePx, r)
  ctx.fill()
  ctx.stroke()

  // Hover cell
  if (hoverCell) {
    const rect = cellToCanvasRect(layout, hoverCell)
    const localX = rect.x - layout.originX
    const localY = rect.y - layout.originY
    const breath = 0.55 + Math.sin(now * 0.006) * 0.08

    ctx.fillStyle = `rgba(131, 153, 88, ${0.12 * breath})`
    ctx.strokeStyle = `rgba(247, 244, 213, ${0.12 * breath})`
    ctx.lineWidth = 1
    roundRect(ctx, localX + 1, localY + 1, rect.w - 2, rect.h - 2, Math.min(10, rect.w * 0.2))
    ctx.fill()
    ctx.stroke()
  }

  // Grid lines
  ctx.strokeStyle = 'rgba(247, 244, 213, 0.08)'
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
  const r = Math.min(radius, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
