import { describe, expect, it } from 'vitest'

import {
  createPartitionRng,
  tryBuildPartitionedPaths,
} from '@/game/generation/algorithms/partitionedPaths'
import { partitionParamsForTier } from '@/game/generation/heuristics/tierParams'
import { validateDisjointPaths } from '@/game/solver/disjointPaths'

describe('tryBuildPartitionedPaths', () => {
  it('produces disjoint valid paths for a deterministic rng stream', () => {
    const rng = createPartitionRng('partition-smoke', 0)
    const params = partitionParamsForTier('beginner')
    const paths = tryBuildPartitionedPaths(rng, params)
    expect(paths).not.toBeNull()
    if (!paths) return
    const v = validateDisjointPaths(paths)
    expect(v.ok).toBe(true)
    expect(paths.size).toBe(4)
  })
})
