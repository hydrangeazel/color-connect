import { describe, expect, it } from 'vitest'

import type { SolutionBoardAnalysis } from '@/game/generation/heuristics/boardMetrics'
import {
  classifyDifficulty,
  scoreGenerationCandidate,
} from '@/game/generation/scoring/qualityScore'

function analysis(partial: Partial<SolutionBoardAnalysis>): SolutionBoardAnalysis {
  return {
    gridSize: 8,
    occupancy: 0.5,
    meanPathLength: 10,
    minPathLength: 6,
    maxPathLength: 14,
    meanTurns: 4,
    junctionPressure: 10,
    deadEndVacancy: 4,
    totalTurns: 16,
    ...partial,
  }
}

describe('qualityScore + classifyDifficulty', () => {
  it('classifies plush crowded layouts as expert', () => {
    const label = classifyDifficulty(
      analysis({
        occupancy: 0.62,
        meanTurns: 6.2,
        junctionPressure: 22,
        minPathLength: 8,
      }),
    )
    expect(label).toBe('expert')
  })

  it('classifies sparse straight layouts as beginner', () => {
    const label = classifyDifficulty(
      analysis({
        occupancy: 0.32,
        meanTurns: 2.1,
        junctionPressure: 6,
        minPathLength: 6,
      }),
    )
    expect(label).toBe('beginner')
  })

  it('scoreGenerationCandidate rejects very open boards for expert tier', () => {
    const tiny: SolutionBoardAnalysis = analysis({
      occupancy: 0.125,
      meanPathLength: 2,
      minPathLength: 2,
      maxPathLength: 2,
      meanTurns: 0,
      junctionPressure: 0,
      deadEndVacancy: 0,
      totalTurns: 0,
    })
    const q = scoreGenerationCandidate(tiny, 'expert')
    expect(q.accepted).toBe(false)
    expect(q.reasons.length).toBeGreaterThan(0)
  })
})
