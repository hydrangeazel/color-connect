import { GRID_SIZE, type GridCell } from '@/types/grid'

export function isWithinGrid(cell: GridCell): boolean {
  return cell.col >= 0 && cell.row >= 0 && cell.col < GRID_SIZE && cell.row < GRID_SIZE
}
