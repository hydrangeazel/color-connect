import type { BoardLayout } from '@/engine/grid/boardLayout'
import { cellToCanvasCenter } from '@/engine/grid/cellMapping'
import { CC_PALETTE, type CcColorKey } from '@/lib/palette'
import type { FrameRenderContext } from '@/types/canvas'
import type { GridCell } from '@/types/grid'

import type { PathsState } from '@/game/logic/pathing/occupation'

export type PathRenderOptions = {
  layout: BoardLayout
  paths: PathsState
  sessionColor: CcColorKey | null
  colorOrder: readonly CcColorKey[]
  now: number
  solved: boolean
  solvedAtMs: number | null
}

const PATH_ORDER: readonly CcColorKey[] = ['moss', 'rose', 'beige', 'midnight', 'forest']

function strokePath(
  ctx: CanvasRenderingContext2D,
  layout: BoardLayout,
  cells: readonly GridCell[],
  color: string,
  width: number,
  glow: number,
) {
  if (cells.length === 0) return
  if (cells.length === 1) {
    const { x, y } = cellToCanvasCenter(layout, cells[0])
    ctx.save()
    ctx.fillStyle = color
    ctx.shadowColor = color
    ctx.shadowBlur = glow
    ctx.beginPath()
    ctx.arc(x, y, width * 0.55, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    return
  }

  ctx.save()
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.strokeStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = glow
  ctx.lineWidth = width

  ctx.beginPath()
  const first = cellToCanvasCenter(layout, cells[0])
  ctx.moveTo(first.x, first.y)
  for (let i = 1; i < cells.length; i += 1) {
    const p = cellToCanvasCenter(layout, cells[i])
    ctx.lineTo(p.x, p.y)
  }
  ctx.stroke()

  ctx.shadowBlur = 0
  ctx.globalAlpha = 0.35
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'
  ctx.lineWidth = Math.max(1, width * 0.22)
  ctx.stroke()

  ctx.restore()
}

export function renderPaths(context: FrameRenderContext, options: PathRenderOptions): void {
  const { ctx } = context
  const { layout, paths, sessionColor, colorOrder, now, solved, solvedAtMs } = options

  const solvePulse =
    solved && solvedAtMs !== null
      ? 0.55 + Math.sin((now - solvedAtMs) * 0.004) * 0.12
      : solved
        ? 0.65
        : 0

  ctx.save()

  const order = colorOrder.length ? colorOrder : PATH_ORDER

  for (const color of order) {
    const cells = paths[color]
    if (!cells?.length) continue

    const base = CC_PALETTE[color]
    const isSession = sessionColor === color
    const width = layout.cellSize * (isSession ? 0.36 : 0.3)
    const glow = (isSession ? 26 : 16) + (solved ? 10 * solvePulse : 0)
    const wobble = isSession ? 1 + Math.sin(now * 0.012) * 0.04 : 1

    strokePath(ctx, layout, cells, base, width * wobble, glow)
  }

  ctx.restore()
}
