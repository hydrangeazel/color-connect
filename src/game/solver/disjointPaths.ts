import { cellToIndex } from '@/game/logic/pathing/cellMath'
import { isOrthogonalChain, isSimplePath } from '@/game/logic/completion/pairCompletion'
import type { CcColorKey } from '@/lib/palette'
import type { GridCell } from '@/types/grid'

import { CELL_COUNT } from '@/game/logic/pathing/cellMath'

/**
 * Verifies disjoint orthogonal paths: each path is simple and orthogonal,
 * and no cell is used by more than one color.
 */
export function validateDisjointPaths(paths: ReadonlyMap<CcColorKey, readonly GridCell[]>): {
  ok: boolean
  issues: string[]
} {
  const issues: string[] = []
  const seen = new Uint8Array(CELL_COUNT)

  for (const [color, cells] of paths) {
    if (!cells.length) {
      issues.push(`${color}: empty path`)
      continue
    }
    if (!isOrthogonalChain(cells) || !isSimplePath(cells)) {
      issues.push(`${color}: invalid path geometry`)
    }
    for (const c of cells) {
      const i = cellToIndex(c)
      if (seen[i]) {
        issues.push(`cell ${c.col},${c.row} used by multiple colors`)
      }
      seen[i] = 1
    }
  }

  return { ok: issues.length === 0, issues }
}
