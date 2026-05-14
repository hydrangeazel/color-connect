import type { BoardLayout } from '@/engine/grid/boardLayout'
import { cellToCanvasCenter } from '@/engine/grid/cellMapping'
import { writeOccupancyMap, type PathsState } from '@/game/logic/pathing/occupation'
import type { PathStepLint } from '@/game/logic/pathing/pathMutation'
import type { CcColorKey } from '@/lib/palette'
import type { FrameRenderContext } from '@/types/canvas'
import type { GridCell } from '@/types/grid'

export type GameplayDebugView = {
  paths: PathsState
  sessionColor: CcColorKey | null
  solved: boolean
  lastPathLint: PathStepLint | 'idle'
  pairByColor: Record<CcColorKey, { a: GridCell; b: GridCell }>
}

export type DebugRenderOptions = {
  layout: BoardLayout
  hoverCell: GridCell | null
  fps: number
  pointerPhase: string
  dragging: boolean
  gameplay: GameplayDebugView
}

const occScratch = new Uint8Array(64)

export function renderDebugOverlay(
  context: FrameRenderContext,
  { layout, hoverCell, fps, pointerPhase, dragging, gameplay }: DebugRenderOptions,
): void {
  const { ctx } = context

  ctx.save()
  ctx.font =
    '11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace'
  ctx.fillStyle = 'rgba(247, 244, 213, 0.85)'
  ctx.strokeStyle = 'rgba(10, 51, 35, 0.65)'
  ctx.lineWidth = 3

  const pathCells = gameplay.sessionColor ? (gameplay.paths[gameplay.sessionColor]?.length ?? 0) : 0

  const hudLines = [
    `fps ${fps.toFixed(0)}`,
    `phase ${pointerPhase}${dragging ? ' · drag' : ''}`,
    hoverCell ? `hover ${hoverCell.col},${hoverCell.row}` : 'hover —',
    `lint ${gameplay.lastPathLint}`,
    `session ${gameplay.sessionColor ?? '—'} len ${pathCells}`,
    `solved ${gameplay.solved ? 'yes' : 'no'}`,
  ]

  let y = 18
  for (const line of hudLines) {
    ctx.strokeText(line, 14, y)
    ctx.fillText(line, 14, y)
    y += 14
  }

  writeOccupancyMap(gameplay.paths, occScratch)

  ctx.translate(layout.originX, layout.originY)
  ctx.font = '9px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
  for (let row = 0; row < layout.gridSize; row += 1) {
    for (let col = 0; col < layout.gridSize; col += 1) {
      const { x, y: cy } = cellToCanvasCenter(layout, { col, row })
      const lx = x - layout.originX
      const ly = cy - layout.originY
      const occ = occScratch[row * layout.gridSize + col]
      const label = `${col},${row}`
      ctx.strokeStyle = 'rgba(10, 51, 35, 0.55)'
      ctx.lineWidth = 2
      ctx.strokeText(label, lx, ly + 3)
      ctx.fillStyle = 'rgba(247, 244, 213, 0.35)'
      ctx.fillText(label, lx, ly + 3)

      if (occ > 0) {
        ctx.fillStyle = 'rgba(131, 153, 88, 0.85)'
        ctx.fillText(String(occ), lx + layout.cellSize * 0.22, ly - layout.cellSize * 0.22)
      }
    }
  }

  ctx.restore()
}
