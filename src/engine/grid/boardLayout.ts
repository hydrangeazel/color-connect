import { GRID_SIZE, type GridCell } from '@/types/grid'

export type BoardLayout = {
  gridSize: typeof GRID_SIZE
  cellSize: number
  boardSizePx: number
  originX: number
  originY: number
}

type ComputeOptions = {
  /** Minimum inset from canvas edges in CSS pixels */
  inset: number
}

/** Tighter inset = larger on-screen board; keep in sync with pointer hit-testing. */
export const BOARD_PLAY_INSET = 14

export function computeBoardLayout(
  canvasCssWidth: number,
  canvasCssHeight: number,
  options: ComputeOptions = { inset: BOARD_PLAY_INSET },
): BoardLayout {
  const inset = options.inset
  const innerW = Math.max(1, canvasCssWidth - inset * 2)
  const innerH = Math.max(1, canvasCssHeight - inset * 2)
  const boardSizePx = Math.min(innerW, innerH)
  const cellSize = boardSizePx / GRID_SIZE

  const originX = (canvasCssWidth - boardSizePx) / 2
  const originY = (canvasCssHeight - boardSizePx) / 2

  return {
    gridSize: GRID_SIZE,
    cellSize,
    boardSizePx,
    originX,
    originY,
  }
}

export function isCellOnBoard(cell: GridCell): boolean {
  return cell.col >= 0 && cell.row >= 0 && cell.col < GRID_SIZE && cell.row < GRID_SIZE
}

export function layoutsEqual(a: BoardLayout | null, b: BoardLayout | null): boolean {
  if (a === b) return true
  if (!a || !b) return false
  return (
    a.cellSize === b.cellSize &&
    a.originX === b.originX &&
    a.originY === b.originY &&
    a.boardSizePx === b.boardSizePx
  )
}
