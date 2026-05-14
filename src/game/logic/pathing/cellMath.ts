import { GRID_SIZE, type GridCell } from '@/types/grid'

export const CELL_COUNT = GRID_SIZE * GRID_SIZE

export function cellToIndex(cell: GridCell): number {
  return cell.row * GRID_SIZE + cell.col
}

export function indexToCell(index: number): GridCell {
  return { col: index % GRID_SIZE, row: Math.floor(index / GRID_SIZE) }
}

export function cellsEqual(a: GridCell, b: GridCell): boolean {
  return a.col === b.col && a.row === b.row
}

export function manhattan(a: GridCell, b: GridCell): number {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row)
}
