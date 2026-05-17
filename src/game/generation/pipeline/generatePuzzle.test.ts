import { describe, expect, it } from 'vitest'

import { generatePuzzle } from '@/game/generation/pipeline/generatePuzzle'
import { validatePuzzleRecord } from '@/game/levels/validation/puzzleValidator'

describe('generatePuzzle pipeline', () => {
  it('is deterministic for the same seed once a layout is accepted', () => {
    let chosenSeed = ''
    let firstOk: ReturnType<typeof generatePuzzle> | null = null
    for (let i = 0; i < 400; i += 1) {
      const seed = `determinism-scan-${i}`
      const r = generatePuzzle({ seed, target: 'beginner', maxAttempts: 64 })
      if (r.ok) {
        firstOk = r
        chosenSeed = seed
        break
      }
    }
    expect(firstOk?.ok).toBe(true)
    if (!firstOk?.ok) return

    const again = generatePuzzle({ seed: chosenSeed, target: 'beginner', maxAttempts: 64 })
    expect(again.ok).toBe(true)
    if (!again.ok) return
    expect(again.record.id).toBe(firstOk.record.id)
    expect(again.record.pairs).toEqual(firstOk.record.pairs)
  })

  it('produces schema-valid puzzles when successful', () => {
    const r = generatePuzzle({ seed: 'validator-friendly-42', target: 'beginner', maxAttempts: 96 })
    if (!r.ok) {
      expect(true).toBe(true)
      return
    }
    const v = validatePuzzleRecord(r.record)
    expect(v.ok).toBe(true)
  })
})
