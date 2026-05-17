import { CELL_COUNT, cellToIndex, indexToCell, manhattan } from '@/game/logic/pathing/cellMath'
import { createMulberry32, randInt, shuffleInPlace } from '@/game/generation/seeds/mulberry32'
import { mixSeed, stringToSeed } from '@/game/generation/seeds/seedHash'
import { bfsShortestPath } from '@/game/solver/bfsPath'
import type { CcColorKey } from '@/lib/palette'
import type { GridCell } from '@/types/grid'

const GEN_COLORS = ['moss', 'rose', 'beige', 'midnight'] as const satisfies readonly CcColorKey[]

const OCC_MARK: Record<(typeof GEN_COLORS)[number], number> = {
  moss: 1,
  rose: 2,
  beige: 3,
  midnight: 4,
}

export type PartitionParams = {
  minManhattan: number
  maxManhattan: number
  minPathLength: number
  /** Random endpoint trials per color before giving up. */
  trialsPerColor: number
}

function pickRandomEndpoints(
  occ: Uint8Array,
  rng: () => number,
  lo: number,
  hi: number,
): [GridCell, GridCell] | null {
  for (let t = 0; t < 220; t += 1) {
    const aI = randInt(rng, CELL_COUNT)
    const bI = randInt(rng, CELL_COUNT)
    if (occ[aI] !== 0 || occ[bI] !== 0) continue
    if (aI === bI) continue
    const a = indexToCell(aI)
    const b = indexToCell(bI)
    const d = manhattan(a, b)
    if (d >= lo && d <= hi) return [a, b]
  }
  return null
}

/**
 * Builds four mutually disjoint orthogonal paths (one per color) by sequential BFS carving.
 * Deterministic given the same RNG stream.
 */
export function tryBuildPartitionedPaths(
  rng: () => number,
  params: PartitionParams,
): Map<CcColorKey, GridCell[]> | null {
  const occ = new Uint8Array(CELL_COUNT)
  const paths = new Map<CcColorKey, GridCell[]>()
  const order: CcColorKey[] = [...GEN_COLORS]
  shuffleInPlace(order, rng)

  for (const color of order) {
    let placed = false
    for (let attempt = 0; attempt < params.trialsPerColor; attempt += 1) {
      const ends = pickRandomEndpoints(occ, rng, params.minManhattan, params.maxManhattan)
      if (!ends) continue
      const [a, b] = ends
      const path = bfsShortestPath(occ, a, b)
      if (!path || path.length < params.minPathLength) continue

      const mark = OCC_MARK[color as (typeof GEN_COLORS)[number]]
      for (const c of path) {
        occ[cellToIndex(c)] = mark
      }
      paths.set(color, path)
      placed = true
      break
    }
    if (!placed) return null
  }

  return paths
}

export function createPartitionRng(seed: string, attempt: number): () => number {
  return createMulberry32(mixSeed(stringToSeed(seed), `attempt:${attempt}`))
}
