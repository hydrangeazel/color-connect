import type { BoardLayout } from '@/engine/grid/boardLayout'
import { cellToCanvasCenter } from '@/engine/grid/cellMapping'
import type { FrameRenderContext } from '@/types/canvas'
import type { GridCell } from '@/types/grid'

export type DebugRenderOptions = {
  layout: BoardLayout
  hoverCell: GridCell | null
  fps: number
  pointerPhase: string
  dragging: boolean
}

export function renderDebugOverlay(
  context: FrameRenderContext,
  { layout, hoverCell, fps, pointerPhase, dragging }: DebugRenderOptions,
): void {
  const { ctx } = context

  ctx.save()
  ctx.font =
    '11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace'
  ctx.fillStyle = 'rgba(247, 244, 213, 0.85)'
  ctx.strokeStyle = 'rgba(10, 51, 35, 0.65)'
  ctx.lineWidth = 3

  const hudLines = [
    `fps ${fps.toFixed(0)}`,
    `phase ${pointerPhase}${dragging ? ' · drag' : ''}`,
    hoverCell ? `hover ${hoverCell.col},${hoverCell.row}` : 'hover —',
  ]

  let y = 18
  for (const line of hudLines) {
    ctx.strokeText(line, 14, y)
    ctx.fillText(line, 14, y)
    y += 14
  }

  ctx.translate(layout.originX, layout.originY)
  ctx.fillStyle = 'rgba(247, 244, 213, 0.55)'
  for (let row = 0; row < layout.gridSize; row += 1) {
    for (let col = 0; col < layout.gridSize; col += 1) {
      const { x, y } = cellToCanvasCenter(layout, { col, row })
      const label = `${col},${row}`
      const lx = x - layout.originX
      const ly = y - layout.originY
      ctx.strokeStyle = 'rgba(10, 51, 35, 0.55)'
      ctx.lineWidth = 2
      ctx.strokeText(label, lx, ly + 3)
      ctx.fillStyle = 'rgba(247, 244, 213, 0.35)'
      ctx.fillText(label, lx, ly + 3)
    }
  }

  ctx.restore()
}
