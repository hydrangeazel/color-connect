import type { GridCell } from '@/types/grid'

export function isOrthogonalAdjacent(a: GridCell, b: GridCell): boolean {
  const dx = Math.abs(a.col - b.col)
  const dy = Math.abs(a.row - b.row)
  return dx + dy === 1
}
