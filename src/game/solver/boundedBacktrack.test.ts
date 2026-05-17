import { describe, expect, it } from 'vitest'

import { boundedBacktrack } from '@/game/solver/boundedBacktrack'

describe('boundedBacktrack', () => {
  it('finds a goal within expansion budget', () => {
    const res = boundedBacktrack(0, {
      maxExpansions: 50,
      children: (n) => (n < 5 ? [n + 1] : []),
      isGoal: (n) => n === 5,
    })
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.solution).toBe(5)
  })

  it('returns limit when budget is tiny', () => {
    const res = boundedBacktrack(0, {
      maxExpansions: 2,
      children: (n) => [n + 1, n + 2],
      isGoal: () => false,
    })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.reason).toBe('limit')
  })
})
