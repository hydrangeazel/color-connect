import type { CcColorKey } from '@/lib/palette'
import { colorKeyToOccupancyIndex } from '@/lib/colorCodec'
import { cellToIndex } from '@/game/logic/pathing/cellMath'
import type { GridCell } from '@/types/grid'

export type PathsState = Partial<Record<CcColorKey, GridCell[]>>

/**
 * Fills `into` with occupancy indices (0 = empty). Last writer wins if overlaps (invalid state).
 * Reuses a single scratch buffer from the gameplay tick — no heap churn.
 */
export function writeOccupancyMap(paths: PathsState, into: Uint8Array): void {
  into.fill(0)
  for (const [colorKey, cells] of Object.entries(paths)) {
    if (!cells?.length) continue
    const idx = colorKeyToOccupancyIndex(colorKey as CcColorKey)
    for (const c of cells) {
      into[cellToIndex(c)] = idx
    }
  }
}
