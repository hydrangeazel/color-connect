import type { ColorPair } from '@/types/puzzle'
import { isPairPathComplete } from '@/game/logic/completion/pairCompletion'
import type { PathsState } from '@/game/logic/pathing/occupation'

export function computePuzzleSolved(pairs: readonly ColorPair[], paths: PathsState): boolean {
  for (const pair of pairs) {
    const path = paths[pair.color]
    if (!path?.length) return false
    if (!isPairPathComplete(path, pair.a, pair.b)) return false
  }
  return pairs.length > 0
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
