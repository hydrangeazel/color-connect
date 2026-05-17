import { GRID_SIZE, type GridCell } from '@/types/grid'

/** Orthogonal neighbors in N, E, S, W order (deterministic traversal). */
export const ORTHO_DELTA: readonly GridCell[] = [
  { col: 0, row: -1 },
  { col: 1, row: 0 },
  { col: 0, row: 1 },
  { col: -1, row: 0 },
]

export function inBounds(cell: GridCell): boolean {
  return cell.col >= 0 && cell.row >= 0 && cell.col < GRID_SIZE && cell.row < GRID_SIZE
}

export function orthogonalNeighbors(cell: GridCell): GridCell[] {
  const out: GridCell[] = []
  for (const d of ORTHO_DELTA) {
    const n = { col: cell.col + d.col, row: cell.row + d.row }
    if (inBounds(n)) out.push(n)
  }
  return out
}

export function isWalkableIndex(
  occ: Uint8Array,
  index: number,
  startIndex: number,
  goalIndex: number,
): boolean {
  if (index === startIndex || index === goalIndex) return true
  return occ[index] === 0
}
