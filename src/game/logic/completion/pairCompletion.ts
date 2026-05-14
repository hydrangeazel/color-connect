import { cellsEqual, manhattan } from '@/game/logic/pathing/cellMath'
import { GRID_SIZE, type GridCell } from '@/types/grid'

export function isOrthogonalChain(cells: readonly GridCell[]): boolean {
  if (cells.length <= 1) return true
  for (let i = 0; i < cells.length - 1; i += 1) {
    if (manhattan(cells[i], cells[i + 1]) !== 1) return false
  }
  return true
}

export function isSimplePath(cells: readonly GridCell[]): boolean {
  const seen = new Set<number>()
  for (const c of cells) {
    const key = c.row * GRID_SIZE + c.col
    if (seen.has(key)) return false
    seen.add(key)
  }
  return true
}

export function isPairPathComplete(
  path: readonly GridCell[],
  endpointA: GridCell,
  endpointB: GridCell,
): boolean {
  if (path.length < 2) return false
  if (!isOrthogonalChain(path) || !isSimplePath(path)) return false

  const head = path[0]
  const tail = path[path.length - 1]
  const touchesA = path.some((c) => cellsEqual(c, endpointA))
  const touchesB = path.some((c) => cellsEqual(c, endpointB))
  if (!touchesA || !touchesB) return false

  const orderedEndpoints =
    (cellsEqual(head, endpointA) && cellsEqual(tail, endpointB)) ||
    (cellsEqual(head, endpointB) && cellsEqual(tail, endpointA))

  return orderedEndpoints
}
