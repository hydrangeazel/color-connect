import { CELL_COUNT, cellToIndex, cellsEqual, indexToCell } from '@/game/logic/pathing/cellMath'
import { ORTHO_DELTA, inBounds, isWalkableIndex } from '@/game/solver/gridGraph'
import type { GridCell } from '@/types/grid'

const parentScratch = new Int32Array(CELL_COUNT)

/**
 * Shortest path on an 8×8 grid with orthogonal moves.
 * Cells with occ[i] !== 0 are walls, except start/goal are always walkable.
 * Tie-breaking follows N,E,S,W neighbor order for reproducibility.
 */
export function bfsShortestPath(
  occ: Uint8Array,
  start: GridCell,
  goal: GridCell,
): GridCell[] | null {
  if (!inBounds(start) || !inBounds(goal)) return null
  if (cellsEqual(start, goal)) return [start]

  const startI = cellToIndex(start)
  const goalI = cellToIndex(goal)

  parentScratch.fill(-1)
  const queue = new Int32Array(CELL_COUNT)
  let qh = 0
  let qt = 0
  queue[qt++] = startI
  parentScratch[startI] = startI

  while (qh < qt) {
    const cur = queue[qh++]!
    if (cur === goalI) {
      const out: GridCell[] = []
      let p = goalI
      while (p !== startI) {
        out.push(indexToCell(p))
        p = parentScratch[p]!
      }
      out.push(start)
      out.reverse()
      return out
    }

    const c = indexToCell(cur)
    for (const d of ORTHO_DELTA) {
      const n = { col: c.col + d.col, row: c.row + d.row }
      if (!inBounds(n)) continue
      const ni = cellToIndex(n)
      if (!isWalkableIndex(occ, ni, startI, goalI)) continue
      if (parentScratch[ni] !== -1) continue
      parentScratch[ni] = cur
      queue[qt++] = ni
    }
  }

  return null
}

export function hasOrthogonalPath(occ: Uint8Array, start: GridCell, goal: GridCell): boolean {
  return bfsShortestPath(occ, start, goal) !== null
}
