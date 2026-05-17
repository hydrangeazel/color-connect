import { cellToIndex, indexToCell } from '@/game/logic/pathing/cellMath'
import { ORTHO_DELTA } from '@/game/solver/gridGraph'
import type { CcColorKey } from '@/lib/palette'
import type { GridCell } from '@/types/grid'

export type SolutionBoardAnalysis = {
  gridSize: number
  /** Fraction of board cells occupied by any path (0–1). */
  occupancy: number
  meanPathLength: number
  minPathLength: number
  maxPathLength: number
  /** Average orthogonal direction changes per path (interaction proxy). */
  meanTurns: number
  /** Empty cells adjacent to three or more path cells (channel pressure). */
  junctionPressure: number
  /** Empty cells with only one empty neighbor (bottleneck hint). */
  deadEndVacancy: number
  /** Sum of per-path turn counts. */
  totalTurns: number
}

function countTurns(cells: readonly GridCell[]): number {
  if (cells.length < 3) return 0
  let turns = 0
  for (let i = 1; i < cells.length - 1; i += 1) {
    const dx1 = cells[i]!.col - cells[i - 1]!.col
    const dy1 = cells[i]!.row - cells[i - 1]!.row
    const dx2 = cells[i + 1]!.col - cells[i]!.col
    const dy2 = cells[i + 1]!.row - cells[i]!.row
    if (dx1 !== dx2 || dy1 !== dy2) turns += 1
  }
  return turns
}

/**
 * Derives heuristics from a known solution layout (disjoint paths).
 */
export function analyzeSolutionLayout(
  paths: ReadonlyMap<CcColorKey, readonly GridCell[]>,
  gridSize: number,
): SolutionBoardAnalysis {
  const occ = new Uint8Array(gridSize * gridSize)
  let sumLen = 0
  let minLen = 999
  let maxLen = 0
  let sumTurns = 0

  for (const cells of paths.values()) {
    const len = cells.length
    sumLen += len
    minLen = Math.min(minLen, len)
    maxLen = Math.max(maxLen, len)
    sumTurns += countTurns(cells)
    for (const c of cells) {
      occ[cellToIndex(c)] = 1
    }
  }

  const n = paths.size || 1
  const meanPathLength = sumLen / n
  const meanTurns = sumTurns / n
  const occupancy = sumLen / (gridSize * gridSize)

  let junctionPressure = 0
  let deadEndVacancy = 0

  for (let i = 0; i < occ.length; i += 1) {
    if (occ[i] !== 0) continue
    const c = indexToCell(i)
    let pathNeighbors = 0
    let emptyNeighbors = 0
    for (const d of ORTHO_DELTA) {
      const n = { col: c.col + d.col, row: c.row + d.row }
      if (n.col < 0 || n.row < 0 || n.col >= gridSize || n.row >= gridSize) continue
      const ni = cellToIndex(n)
      if (occ[ni] === 0) emptyNeighbors += 1
      else pathNeighbors += 1
    }
    if (pathNeighbors >= 3) junctionPressure += 1
    if (emptyNeighbors === 1) deadEndVacancy += 1
  }

  return {
    gridSize,
    occupancy,
    meanPathLength,
    minPathLength: minLen === 999 ? 0 : minLen,
    maxPathLength: maxLen,
    meanTurns,
    junctionPressure,
    deadEndVacancy,
    totalTurns: sumTurns,
  }
}
