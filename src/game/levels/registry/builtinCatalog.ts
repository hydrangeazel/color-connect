import beginnerMeadow from '@/game/levels/puzzles/beginner-meadow.json'
import intermediateTwist from '@/game/levels/puzzles/intermediate-twist.json'
import advancedStrand from '@/game/levels/puzzles/advanced-strand.json'
import { assertValidPuzzlePayload, type LoadedPuzzle } from '@/game/levels/loaders/puzzleLoader'

const rawCatalog = [beginnerMeadow, intermediateTwist, advancedStrand] as const

function assertUniqueIds(entries: readonly LoadedPuzzle[]) {
  const seen = new Set<string>()
  for (const e of entries) {
    if (seen.has(e.id)) {
      throw new Error(`Duplicate puzzle id in builtin catalog: ${e.id}`)
    }
    seen.add(e.id)
  }
}

/** Validated, ordered builtin puzzles shipped with the client bundle. */
export const BUILTIN_PUZZLES: readonly LoadedPuzzle[] = (() => {
  const loaded = rawCatalog.map((raw) => assertValidPuzzlePayload(raw))
  assertUniqueIds(loaded)
  return loaded
})()
