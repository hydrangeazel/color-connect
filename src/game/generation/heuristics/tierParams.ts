import type { PartitionParams } from '@/game/generation/algorithms/partitionedPaths'
import type { PuzzleDifficulty } from '@/game/levels/schemas/puzzleRecord'

export function partitionParamsForTier(tier: PuzzleDifficulty): PartitionParams {
  switch (tier) {
    case 'beginner':
      return { minManhattan: 5, maxManhattan: 12, minPathLength: 4, trialsPerColor: 240 }
    case 'intermediate':
      return { minManhattan: 4, maxManhattan: 13, minPathLength: 4, trialsPerColor: 280 }
    case 'advanced':
      return { minManhattan: 3, maxManhattan: 14, minPathLength: 3, trialsPerColor: 340 }
    case 'expert':
      return { minManhattan: 2, maxManhattan: 14, minPathLength: 3, trialsPerColor: 400 }
  }
}
