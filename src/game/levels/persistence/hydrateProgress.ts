import type { LoadedPuzzle } from '@/game/levels/loaders/puzzleLoader'
import { createEmptySave, type SaveFileV1 } from '@/game/levels/persistence/saveSchema'

export type HydrateResult = {
  save: SaveFileV1
  startIndex: number
}

/**
 * Merges disk state with catalog invariants (first puzzle always addressable).
 */
export function hydrateProgress(
  disk: SaveFileV1 | null,
  catalog: readonly LoadedPuzzle[],
): HydrateResult {
  const firstId = catalog[0]?.id
  if (!firstId) {
    return { save: createEmptySave('missing'), startIndex: 0 }
  }

  if (!disk) {
    return { save: createEmptySave(firstId), startIndex: 0 }
  }

  const catalogIds = new Set(catalog.map((c) => c.id))
  const unlocked = disk.unlockedLevelIds.filter((id) => catalogIds.has(id))
  const solved = disk.solvedLevelIds.filter((id) => catalogIds.has(id))

  if (!unlocked.includes(firstId)) {
    unlocked.unshift(firstId)
  }

  const current =
    disk.currentLevelId && catalogIds.has(disk.currentLevelId) ? disk.currentLevelId : firstId

  const save: SaveFileV1 = {
    v: 1,
    unlockedLevelIds: [...new Set(unlocked)],
    solvedLevelIds: [...new Set(solved)],
    currentLevelId: current,
    settings: disk.settings ?? {},
  }

  const startIndex = Math.max(
    0,
    catalog.findIndex((c) => c.id === current),
  )

  return { save, startIndex }
}
