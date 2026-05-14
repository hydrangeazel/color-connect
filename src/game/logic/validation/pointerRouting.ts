import type { CcColorKey } from '@/lib/palette'
import type { BoardNode, GridCell } from '@/types/grid'
import type { ColorPair } from '@/types/puzzle'
import { cellsEqual } from '@/game/logic/pathing/cellMath'
import type { PathsState } from '@/game/logic/pathing/occupation'

export function indexOfCellInPath(path: readonly GridCell[], cell: GridCell): number {
  return path.findIndex((c) => cellsEqual(c, cell))
}

export function isEndpointForColor(
  cell: GridCell,
  color: CcColorKey,
  pairByColor: Record<CcColorKey, { a: GridCell; b: GridCell }>,
): boolean {
  const pair = pairByColor[color]
  if (!pair) return false
  return cellsEqual(cell, pair.a) || cellsEqual(cell, pair.b)
}

export function resolveColorUnderPointer(
  cell: GridCell,
  nodes: readonly BoardNode[],
  paths: PathsState,
): CcColorKey | null {
  const node = nodes.find((n) => n.col === cell.col && n.row === cell.row)
  if (node) return node.colorKey

  for (const [key, cells] of Object.entries(paths)) {
    if (!cells?.length) continue
    if (cells.some((c) => cellsEqual(c, cell))) return key as CcColorKey
  }
  return null
}

export function initialPathForPointerDown(
  color: CcColorKey,
  cell: GridCell,
  paths: PathsState,
  pairByColor: Record<CcColorKey, { a: GridCell; b: GridCell }>,
): GridCell[] | null {
  const existing = paths[color] ?? []
  const idx = indexOfCellInPath(existing, cell)
  if (idx >= 0) return existing.slice(0, idx + 1)
  if (isEndpointForColor(cell, color, pairByColor)) return [cell]
  return null
}

export function pairsFromRecord(
  pairByColor: Record<CcColorKey, { a: GridCell; b: GridCell }>,
): ColorPair[] {
  return (Object.keys(pairByColor) as CcColorKey[]).map((color) => ({
    color,
    a: pairByColor[color].a,
    b: pairByColor[color].b,
  }))
}
