import { describe, expect, it } from 'vitest'

import { createMulberry32, randInt } from '@/game/generation/seeds/mulberry32'
import { stringToSeed } from '@/game/generation/seeds/seedHash'

describe('seedHash + mulberry32', () => {
  it('stringToSeed is stable', () => {
    expect(stringToSeed('hello')).toBe(stringToSeed('hello'))
    expect(stringToSeed('hello')).not.toBe(stringToSeed('hallo'))
  })

  it('mulberry32 stream is deterministic for a fixed seed', () => {
    const a = createMulberry32(12345)
    const b = createMulberry32(12345)
    const seqA = Array.from({ length: 8 }, () => a())
    const seqB = Array.from({ length: 8 }, () => b())
    expect(seqA).toEqual(seqB)
  })

  it('randInt stays within range', () => {
    const rng = createMulberry32(999)
    for (let i = 0; i < 50; i += 1) {
      const v = randInt(rng, 8)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(8)
    }
  })
})
