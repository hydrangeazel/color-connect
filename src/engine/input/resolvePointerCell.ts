import type { BoardLayout } from '@/engine/grid/boardLayout'
import { canvasPointToCell, cellToCanvasCenter } from '@/engine/grid/cellMapping'
import { NODE_HIT_RADIUS_CELL, NODE_HIT_RADIUS_DRAG_CELL } from '@/engine/input/nodeHitConstants'
import { cellsEqual } from '@/game/logic/pathing/cellMath'
import type { PathsState } from '@/game/logic/pathing/occupation'
import type { CcColorKey } from '@/lib/palette'
import type { BoardNode, GridCell } from '@/types/grid'

type PairByColor = Record<CcColorKey, { a: GridCell; b: GridCell }>

function cellIsInteriorPathCell(
  cell: GridCell,
  paths: PathsState | undefined,
  pairByColor: PairByColor | undefined,
): boolean {
  if (!paths || !pairByColor) return false
  for (const color of Object.keys(paths) as CcColorKey[]) {
    const line = paths[color]
    if (!line?.length) continue
    if (!line.some((c) => cellsEqual(c, cell))) continue
    const ep = pairByColor[color]
    if (!ep) continue
    if (cellsEqual(cell, ep.a) || cellsEqual(cell, ep.b)) continue
    return true
  }
  return false
}

export type ResolvePointerCellOptions = {
  paths?: PathsState
  pairByColor?: PairByColor
  /** When true, use a larger acquisition radius. */
  dragging?: boolean
}

/**
 * Resolves a grid cell for **pointer-down / picking** only: forgiving node magnet + path-interior
 * priority. Do **not** use while dragging — use `canvasPointToCellClamped` so adjacent cells resolve
 * correctly and paths can extend.
 */
export function resolvePointerCell(
  layout: BoardLayout,
  canvasLocalX: number,
  canvasLocalY: number,
  nodes: readonly BoardNode[],
  options?: ResolvePointerCellOptions,
): GridCell | null {
  const direct = canvasPointToCell(layout, canvasLocalX, canvasLocalY)

  if (direct && cellIsInteriorPathCell(direct, options?.paths, options?.pairByColor)) {
    return direct
  }

  if (direct) {
    const onNode = nodes.some((n) => n.col === direct.col && n.row === direct.row)
    if (onNode) return direct
  }

  const hitR =
    layout.cellSize * (options?.dragging ? NODE_HIT_RADIUS_DRAG_CELL : NODE_HIT_RADIUS_CELL)
  const hitR2 = hitR * hitR

  let best: { cell: GridCell; d2: number; id: string } | null = null
  for (const n of nodes) {
    const c = cellToCanvasCenter(layout, n)
    const dx = canvasLocalX - c.x
    const dy = canvasLocalY - c.y
    const d2 = dx * dx + dy * dy
    if (d2 > hitR2) continue
    if (!best || d2 < best.d2 || (d2 === best.d2 && n.id < best.id)) {
      best = { cell: { col: n.col, row: n.row }, d2, id: n.id }
    }
  }
  if (best) return best.cell

  return direct
}
