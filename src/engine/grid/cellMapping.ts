import type { BoardLayout } from '@/engine/grid/boardLayout'
import { GRID_SIZE, type GridCell } from '@/types/grid'

export function canvasPointToCell(
  layout: BoardLayout,
  canvasLocalX: number,
  canvasLocalY: number,
): GridCell | null {
  const lx = canvasLocalX - layout.originX
  const ly = canvasLocalY - layout.originY

  if (lx < 0 || ly < 0 || lx >= layout.boardSizePx || ly >= layout.boardSizePx) {
    return null
  }

  const col = Math.floor(lx / layout.cellSize)
  const row = Math.floor(ly / layout.cellSize)

  if (col < 0 || row < 0 || col >= GRID_SIZE || row >= GRID_SIZE) return null
  return { col, row }
}

/** Maps to the cell under the pointer; clamps to the board so edge pixels still resolve. */
export function canvasPointToCellClamped(
  layout: BoardLayout,
  canvasLocalX: number,
  canvasLocalY: number,
): GridCell | null {
  const ox = layout.originX
  const oy = layout.originY
  const s = layout.boardSizePx
  const cx = Math.min(Math.max(canvasLocalX, ox + 1e-3), ox + s - 1e-3)
  const cy = Math.min(Math.max(canvasLocalY, oy + 1e-3), oy + s - 1e-3)
  return canvasPointToCell(layout, cx, cy)
}

export function cellToCanvasCenter(layout: BoardLayout, cell: GridCell): { x: number; y: number } {
  return {
    x: layout.originX + (cell.col + 0.5) * layout.cellSize,
    y: layout.originY + (cell.row + 0.5) * layout.cellSize,
  }
}

export function cellToCanvasRect(
  layout: BoardLayout,
  cell: GridCell,
): { x: number; y: number; w: number; h: number } {
  return {
    x: layout.originX + cell.col * layout.cellSize,
    y: layout.originY + cell.row * layout.cellSize,
    w: layout.cellSize,
    h: layout.cellSize,
  }
}
