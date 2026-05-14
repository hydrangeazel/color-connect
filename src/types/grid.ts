import type { CcColorKey } from '@/lib/palette'

export const GRID_SIZE = 8 as const

export type GridCell = {
  col: number
  row: number
}

export type BoardNode = {
  id: string
  col: number
  row: number
  colorKey: CcColorKey
}
