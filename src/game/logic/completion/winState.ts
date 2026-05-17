import { isPairPathComplete } from '@/game/logic/completion/pairCompletion'
import { CELL_COUNT, cellToIndex } from '@/game/logic/pathing/cellMath'
import type { PathsState } from '@/game/logic/pathing/occupation'
import type { ColorPair } from '@/types/puzzle'

/** True when every board cell lies on at least one path (Flow-style “fill the grid”). */
export function isGridFullyCovered(paths: PathsState): boolean {
  const seen = new Set<number>()
  for (const line of Object.values(paths)) {
    if (!line?.length) continue
    for (const c of line) {
      seen.add(cellToIndex(c))
    }
  }
  return seen.size === CELL_COUNT
}

export function computePuzzleSolved(pairs: readonly ColorPair[], paths: PathsState): boolean {
  if (pairs.length === 0) return false
  for (const pair of pairs) {
    const path = paths[pair.color]
    if (!path?.length) return false
    if (!isPairPathComplete(path, pair.a, pair.b)) return false
  }
  return isGridFullyCovered(paths)
}

export function completionRatio(
  pairs: readonly ColorPair[],
  paths: PathsState,
): { complete: number; total: number } {
  let complete = 0
  for (const pair of pairs) {
    const path = paths[pair.color]
    if (path?.length && isPairPathComplete(path, pair.a, pair.b)) complete += 1
  }
  return { complete, total: pairs.length }
}
